import {createStore} from 'redux';

function easyRedux(initialState,
                   actions,
                   useNumberActions=false) {
    const numbersToActions = Object.keys(actions);
    const reducer = (state, _action) => {
        const {type, ...action} = _action;
        let f = actions[useNumberActions ? numbersToActions[type] : type];
        if (f) {
            return f(state, action);
        }
        return state;
    };

    let store = createStore(reducer, initialState);
    store.actions = {};
    for (const [actionName, stateTransform] of Object.entries(actions)) {
        const type = useNumberActions ? numbersToActions.findIdx(actionName) : actionName;
        store[actionName] = args => store.dispatch(({type, ...args}));
    }
    return store;
}

export default easyRedux;
