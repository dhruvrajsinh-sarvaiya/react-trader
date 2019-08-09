/**
 *   Developer : Parth Andhariya
 *   Date : 22-04-2019
 *   Component: Open Position Report reducer 
 */

import {
    GET_OPEN_POSITION_REPORT_LIST,
    GET_OPEN_POSITION_REPORT_LIST_SUCCESS,
    GET_OPEN_POSITION_REPORT_LIST_FAILURE,

} from "Actions/types";
//initial state
const INITIAL_STATE = {
    loading: false,
    Report: [],
};
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        //List action
        case GET_OPEN_POSITION_REPORT_LIST:
            return {
                ...state,
                loading: true,
            };

        case GET_OPEN_POSITION_REPORT_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                Report: action.payload.Data[0].DetailedData,
            };
        case GET_OPEN_POSITION_REPORT_LIST_FAILURE:
            return {
                ...state,
                loading: false,
                Report: [],
            };
        default:
            return { ...state };
    }
};
