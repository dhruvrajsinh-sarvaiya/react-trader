/**
 * Auther : Salim Deraiya
 * Created : 10/10/2018
 * Normal Login Reducers
 */
import {
    NORMAL_LOGIN, 
    NORMAL_LOGIN_SUCCESS, 
    NORMAL_LOGIN_FAILURE
 } from 'Actions/types';
 
 
 /*
 * Initial State
 */
const INIT_STATE = {
    loading : false,
	user: localStorage.getItem('user_id'),
    data : []
}

//Check Action for Normal Login...
export default (state = INIT_STATE, action) => {
    switch(action.type) 
    {
        case NORMAL_LOGIN:
            return { ...state, loading : true, data : '' };

        case NORMAL_LOGIN_SUCCESS:
            return { ...state, loading : false, data : action.payload };

        case NORMAL_LOGIN_FAILURE:
            return { ...state, loading : false, data : action.payload };

        default : 
            return { ...state };
    }
}