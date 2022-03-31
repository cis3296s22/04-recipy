import ReactDOM from 'react-dom';
import React from 'react';

let recipe = JSON.parse(window._json);

const RecipeDetails = ({owner, activeTime, passiveTime, makes, name, description, numSteps, equipment, ingredients}) => {
	return <div>
		<h3>{name}</h3>
		<p>{description}</p>
                <p>By <a href={`/users/${owner.id}/`}>{owner.first_name} {owner.last_name}</a></p>
		<ul>
			<li>Steps: {numSteps}</li>
			{activeTime && <li>Active Time: {activeTime}</li>}
			{passiveTime && <li>Passive Time: {passiveTime}</li>}
			{makes && <li>Makes: {makes}</li>}
		</ul>
	</div>;
};

const RecipeStep = ({step}) => {
	console.log(step);
	return <div className="recipe-step">
		
	</div>
};

const RecipeSteps = ({steps=[]}) => {
    return <div className="recipe-steps">
	{steps.map((x, i) => <RecipeStep key={i} step={x} />)}
    </div>;
};

const Recipe = ({recipe}) => {
    let eq = []
    let igs = []

    for (const s of recipe.steps) {
        for (const i of s.ingredients) {
            igs.push(i);
        }

        for (const e of s.equipment) {
	    eq.push(eq);
        }
    }

    return <div>
        <RecipeDetails owner={recipe.owner} name={recipe.name} description={recipe.description} numSteps={recipe.steps.length} equipment={eq} ingredients={igs} />
        <RecipeSteps steps={recipe.steps} />
    </div>;
};

ReactDOM.render(<Recipe recipe={recipe} />, document.querySelector('#content'));
