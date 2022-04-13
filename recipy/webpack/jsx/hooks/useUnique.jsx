import {useMemo} from 'react';
import uuidv4 from '../util/uuidv4';

const useUnique = () => {
    return useMemo(() => uuidv4(), []);
};

export default useUnique; 
