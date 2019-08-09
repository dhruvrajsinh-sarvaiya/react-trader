/*
Name: Tejas Gauswami
Use : Reducer for  Place Order
Date  : 12/6/2019
*/

import {

    // types Exchange List
    ARBITRAGE_EXCHANGE_LIST,
    ARBITRAGE_EXCHANGE_LIST_SUCCESS,
    ARBITRAGE_EXCHANGE_LIST_FAILURE

}
    from 'Actions/types';

// Set Initial State
const INITIAL_STATE = {

    arbitrageExchange: [],
    arbitrageExchangeLoading: 0,
    arbitrageExchangeError: [],
    arbitrageExchangeUpdateBit:1
};

export default (state = INITIAL_STATE, action) => {

    switch (action.type) {

        //  Exchange List
        case ARBITRAGE_EXCHANGE_LIST:
            return { ...state, arbitrageExchangeLoading: true, arbitrageExchangeError: [], arbitrageExchange: [] };

        // set Data Of  Exchange List
        case ARBITRAGE_EXCHANGE_LIST_SUCCESS:

            return { arbitrageExchangeError: [], arbitrageExchange: action.payload.response, arbitrageExchangeLoading: false,arbitrageExchangeUpdateBit:++state.arbitrageExchangeUpdateBit };

        // Display Error for Exchange List failure
        case ARBITRAGE_EXCHANGE_LIST_FAILURE:

            return { arbitrageExchangeError: action.payload, arbitrageExchangeLoading: false, arbitrageExchange: [], arbitrageExchangeUpdateBit:++state.arbitrageExchangeUpdateBit };

        default: return { ...state };
    }
}