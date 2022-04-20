import "./polyfills";
import ReactDOM from 'react-dom';
import React from 'react';
import {useState, useEffect, useRef} from 'react';
import {StrictMode} from 'react';
import {Provider, useSelector} from 'react-redux';
import easyRedux from './util/easyRedux';
import Modal from './components/Modal';
import NavBar from './navbar';

let recipe = JSON.parse(window._json);

let store = easyRedux(recipe, {
    setRecipeName: (state, {name}) => {
        return {...state, name};
    },
    setRecipeDescription: (state, {description}) => {
        return {...state, description};
    },
    setRecipeMakes: (state, {makes}) => {
        return {...state, makes};
    },
    addEquipment: (state, {step, equipment}) => {
        let idx = state.steps.indexOf(step);
        let steps = [...state.steps];
        steps[idx] = {...steps[idx], equipment: [...steps[idx].equipment, equipment]}
        return {...state, steps};
    },
    deleteEquipment: (state, {step, equipment}) => {
        let steps = [...state.steps];
        const stepIdx = state.steps.indexOf(step);
        let e = steps[stepIdx].equipment;
        e[e.indexOf(equipment)] = {...equipment, deleted: true};
	return {...state, steps};
    },
    addIngredient: (state, {step, ingredient}) => {
        let idx = state.steps.indexOf(step);
        let steps = [...state.steps];
        steps[idx] = {...steps[idx], ingredients: [...steps[idx].ingredients, ingredient]}
        return {...state, steps};
    },
    updateIngredient: (state, {step, oldIngredient, newIngredient}) => {
        let steps = [...state.steps];
        const stepIdx = state.steps.indexOf(step);
        let ingredients = steps[stepIdx].ingredients;
        const ingredientIdx = ingredients.indexOf(oldIngredient);
        ingredients[ingredientIdx] = newIngredient;
        steps[stepIdx].ingredients = ingredients;
	return {...state, steps};
    },
    deleteIngredient: (state, {step, ingredient}) => {
        state.updateIngredient({step, oldIngredient: ingredient, newIngredient: {...ingredient, deleted: true}});
    },
    setProcess: (state, {step, process}) => {
        let idx = state.steps.indexOf(step);
        let steps = [...state.steps];
        steps[idx] = {...steps[idx], process}
        return {...state, steps};
    },
    setTime: (state, {step, time}) => {
        let idx = state.steps.indexOf(step);
        let steps = [...state.steps];
        steps[idx] = {...steps[idx], time}
        return {...state, steps}; 
    },
    addStep: (state, {}) => {
        return {...state, steps: [...state.steps, {ingredients: [], equipment: []}]};
    }
});

const backgroundsColor = '#EEE';
const backgroundsBr = 3;
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
	background: backgroundsColor,
	borderRadius: backgroundsBr,
	width: 300,
	display: 'flex',
	flexFlow: 'column nowrap'
    },
    recipeStep: {
	margin: '10px 0',
	padding: 10,
	boxSizing: 'border-box',
	background: backgroundsColor,
	borderRadius: backgroundsBr,
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
		margin: '7.5px 0',
		marginRight: 7.5,
		cursor: 'pointer'
	},
	equipment: {
		width: '50%'
	},
        ingredients: {
		width: '50%'
	},
plusButton: {
	cursor: 'pointer',
	fontSize: '2rem',
	background: 'none',
	border: 'none'
}
};

// Because some CSS is easier old school...
const CSS = `
.recipe-step__ingredients__ingredient:hover {
	color: gray;
}
`;

const HUMAN_UNITS = [
	'',
	'g',
	'kg',
	'mL',
	'L',
	' pinch(es)',
	''
];

const useEditable = () => {
    const currentUser = useSelector(s => s.currentUser);
    const owner = useSelector(s => s.owner);
    return currentUser && currentUser.id === owner.id;
};

const SearchBox = ({endpoint, onSelect, display, placeholder="Begin typing..."}) => {
    const [data, setData] = useState([]);
    const [s, setS] = useState('');
    const ref = useRef();

    useEffect(() => {
        fetch('/json/search/' + endpoint + '/?s=' + s).then(x => x.json()).then(x => {
        	setData(x);
    	});
    }, [s, setData]);

    return <div style={{position: 'relative'}}>
        <input style={{width: 200}} placeholder={placeholder} onChange={e => {
             setS(e.target.value);
        }} value={s} />
        <div ref={ref} style={{position: 'absolute', background: 'white', display: 'flex', flexFlow: 'column nowrap', width: 200}}>
            {data.map((x, idx) => <div style={{padding: 10, cursor: 'pointer'}} key={idx} onClick={() => onSelect(x)}>{display(x)}</div>)}
        </div>
    </div>;
};

const RecipeDetails = ({}) => {
    const steps = useSelector(s => s.steps);
    const owner = useSelector(s => s.owner);
    const name = useSelector(s => s.name);
    const description = useSelector(s => s.description);
    const makes = useSelector(s => s.makes);
    const picture = useSelector(s => s.picture);
    const numSteps = steps.length;

    let isEditable = useEditable();

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

    const onMakesChange = e => {
        let v = parseInt(e.target.value);
        if (isNaN(v)) v = 0;
        store.setRecipeMakes({makes: v});
    };

    return <div className="recipe-details" style={style.recipeDetails}>
		<img src={picture ? picture.url : null} style={{margin: '0 auto', marginBottom: 20, width: 150, height: 150, borderRadius: '100%', background: 'gray'}} />
		{!isEditable && <h2 style={{fontSize: '2rem', marginBottom: 5}}>{name}</h2>}
		{isEditable && <input style={{fontSize: '2rem', marginBottom: 5}} placeholder="Recipe name..." onChange={e => store.setRecipeName({name: e.target.value})} value={name} />}
                <p style={{fontSize: '1rem', marginBottom: 10}}>By <a href={`/users/${owner.id}/`}>{owner.first_name} {owner.last_name}</a></p>
		{!isEditable && <p style={{margin: '10px 0'}}>{description}</p>}
	        {isEditable && <textarea style={{resize: 'none', width: '100%', height: 300, margin: '10px 0'}} onChange={e => store.setRecipeDescription({description: e.target.value}) } value={description} />}
		<ul style={{}}>
			<li>{numSteps == 1 ? "1 Step" : `${numSteps} Steps`}</li>
			{!isEditable && makes && <li>Makes {makes}</li>}
                        {isEditable && <li>Makes <input value={makes ? makes : ''} onChange={onMakesChange} /></li>}
		</ul>
    </div>;
};

const Process = ({process, step}) => {
        const isEditable = useEditable();
        const [modalVisible, setMV] = useState(false);

        const onClick = () => {
		if (isEditable) {
			setMV(true);
                }
        };

        const onSelect = x => {
		store.setProcess({step, process: x});
		setMV(false);
        };

	return <>
		<span onClick={onClick} className="recipe-step__process" style={{...style.process, cursor: isEditable ? 'pointer' : undefined}} data-tooltip={isEditable ? null : process.description}>
			{process.name}
		</span>
		{modalVisible && <Modal onClose={() => setMV(false)}>
			<SearchBox endpoint='process' display={x => x.name} onSelect={onSelect}/>
		</Modal>}
	</>;
};

const Time = ({step, time}) => {
        const isEditable = useEditable();

        const entries = Object.entries(time ?? {});

	if (!isEditable) {
		return <div className="recipe-step__time" style={style.time}>
			{entries.map(([k, v]) => !v ? null : <span key={k}>{v} {k}</span>)}
		</div>;
	}
        
	let [units, scalar] = entries.find(([k, v]) => v && v > 0) ?? (entries.length > 0 ? entries[0] : ['seconds', 0]);
        const onScalarChange = e => {
		let v = parseInt(e.target.value);
		if (isNaN(v)) v = 0;
		store.setTime({step, time: {[units]: v}});
        };

        const onUnitsChange = e => {
		let v = e.target.value;
		store.setTime({step, time: {[v]: scalar}});
        }

	return <div style={style.time}>
		<input value={scalar ? scalar : ''} onChange={onScalarChange} />
		<select onChange={onUnitsChange}>
			<option value='seconds'>Seconds</option>
			<option value='minutes'>Minutes</option>
			<option value='hours'>Hours</option>
		</select>
	</div>;
};

const Ingredient = ({ingredient, step}) => {
	const [modalVisible, setModalVisible] = useState(false);
        const onComplete = x => {
		store.updateIngredient({step, oldIngredient: ingredient, newIngredient: x});
		setModalVisible(false);
        };
	return <div className="recipe-step__ingredients__ingredient" style={style.ingredient}>
		<span onClick={() => setModalVisible(true)}>{ingredient.amount.value}{HUMAN_UNITS[ingredient.amount.units]} {ingredient.name}</span>
		{modalVisible && <Modal onClose={() => setModalVisible(false)}>
			<IngredientPicker onComplete={onComplete} saveText="Update" ingredient={ingredient} amount={ingredient.amount.value} units={ingredient.amount.units} />
		</Modal>}
	</div>;
};

const IngredientPicker = ({saveText='Add', ingredient:_ingredient=null, amount:_amount=0, units:_units=1, onComplete}) => {
        const [ing, setIng] = useState(_ingredient);
	const [amount, setAmount] = useState(_amount);
        const [units, setUnits] = useState(_units);

	const onSelect = v => {
		setIng(v);
        }

        const valueChange = e => {
		let v = e.target.value;
 		if (isNaN(v)) v = 0;
		setAmount(v);
        };

        const btnClick = () => {
		onComplete({...ing, amount: {units, value: amount}});
        };

        const setUnitsF = e => {
		return setUnits(parseInt(e.target.value));
	}

        const UNITS = Object.entries({
		"1": "Grams",
		"2": "Kilograms",
		"3": "Milliliters",
		"4": "Liters",
		"5": "Pinches",
		"6": "Unitless"
        });

	return <div>
		<input value={amount} onChange={valueChange}/>
		<select onChange={setUnitsF}>
			{UNITS.map(([value, label], idx) => <option key={idx} value={value} selected={`${units}` === value}>{label}</option>)}
		</select>
		{!ing && <SearchBox endpoint='ingredient' display={x => x.name} onSelect={onSelect} />}
		{ing && <button onClick={() => setIng(null)}>{ing.name}</button>}
		<button onClick={btnClick}>{saveText}</button>
	</div>
};

const Ingredients = ({step, ingredients}) => {
	const isEditable = useEditable();
	const [modalVisible, setModalVisible] = useState(false);

        const onComplete = x => {
		store.addIngredient({step, ingredient: x});
		setModalVisible(false);
        };

	return <div className="recipe-step__ingredients" style={style.ingredients}>
		<h3 style={{marginBottom: 5, fontWeight: 'bold'}}>Ingredients</h3>
		{ingredients.map((x, i) => <Ingredient key={i} ingredient={x} step={step} />)}
                {modalVisible && <Modal onClose={() => setModalVisible(false)}>
			<IngredientPicker onComplete={onComplete} />
		</Modal>}
		{isEditable && <button style={style.plusButton} onClick={() => setModalVisible(true)}>+</button>}
	</div>;
};

const Equipment = ({equipment:{maker, name, kind}}) => {
	return <div className="recipe-step__equipment-list__equipment" style={{}}>
		<span>{kind} <strong style={{fontWeight: 'bold'}}>{name}</strong> from {maker}</span>
	</div>;
};

const EquipmentList = ({equipment, step}) => {
	const isEditable = useEditable();
        const [searchVisible, setSV] = useState(false);

        const onSelect = x => {
		store.addEquipment({step, equipment: x});
		setSV(false);
	};

	return <div className="recipe-step__equipment-list" style={style.equipmentList}>
		<h3 style={{marginBottom: 5, fontWeight: 'bold'}}>Equipment</h3>
		{equipment.map((x, i) => <Equipment equipment={x} key={i} />)}
		{isEditable && <button style={style.plusButton} onClick={e => setSV(true)}>+</button>}
                {searchVisible && <Modal onClose={e => setSV(false)}><SearchBox endpoint='equipment' display={x => x.name} onSelect={onSelect} /></Modal>}
	</div>;
}

const RecipeStep = ({step}) => {
	const [showingProcessModal, setSPM] = useState(false);
	return <div className="recipe-step" style={style.recipeStep}>
		<div style={{...style.row, justifyContent: 'space-between', marginBottom: 10}}>
			{step.process && <Process process={step.process} />}
                        {!step.process && <SearchBox endpoint='process' display={x => x.name} onSelect={x => store.setProcess({step, process: x})}/>}
			<Time step={step} time={step.time} />
		</div>
		<div style={style.row}>
			<Ingredients ingredients={step.ingredients} step={step} />
			<EquipmentList equipment={step.equipment} step={step} />
		</div>
	</div>;
};

const RecipeSteps = ({}) => {
    const isEditable = useEditable();
    const steps = useSelector(s => s.steps);

    const save = () => {
        let json = store.getState();
        fetch('/json/save/recipe/', {
            method: 'POST',
            'Content-Type': 'application/json',
            body: JSON.stringify(json)
        }).then(x => x.json()).then(({recipe_id}) => { window.location.pathname = `/recipe/${recipe_id}/`; });
    };

    return <div className="recipe-steps" style={style.recipeSteps}>
	<div>
		<h3 style={{fontSize: '1.5rem'}}>Steps</h3>
		{isEditable && <button onClick={save}>Save</button>}
	</div>
	<div style={{display: 'flex', flexFlow: 'column nowrap', alignItems: 'center'}}>
     	    {steps.map((x, i) => <RecipeStep key={i} step={x} />)}
            {isEditable && <button style={style.plusButton} onClick={e => store.addStep()}>+</button>}
        </div>
    </div>;
};

const Recipe = ({}) => {
    const loggedIn = useSelector(s => Boolean(s.currentUser));
    return <NavBar loggedIn={loggedIn}>
		<div className="recipe" style={style.recipe}>
			<RecipeDetails />
			<RecipeSteps />
		</div>
	</NavBar>;
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
{CSS}
	</style>
	<Provider store={store}>
            <Recipe />
	</Provider>
    </StrictMode>, document.querySelector('#content'));
