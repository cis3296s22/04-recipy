
const _uuidv4Replace = c => {
    let r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); // eslint-disable-line no-extra-parens
};

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, _uuidv4Replace);

export default uuidv4;
