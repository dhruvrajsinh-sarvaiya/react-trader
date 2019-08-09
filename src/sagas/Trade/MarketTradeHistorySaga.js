// sagas For Market Trade History Actions By Tejas Date : 14/9/2018

// effects for redux-saga
import { all, call, fork, put, take, takeEvery } from 'redux-saga/effects';

// types for set actions and reducers
import {
    // GET_MARKET_TRADE_HISTORY,
    // CHANGE_MARKET_TRADE_HISTORY_SOCKET,
    CLOSE_SOCKET_CONNECTION
} from 'Actions/types';

// action sfor set data or response
import {
    // getMarketTradeHistorySuccess,
    getMarketTradeHistoryFailure
} from 'Actions/Trade';

// socket connection URL
// const marketTradeSocketServerURL = 'http://172.20.65.131:3003';
let marketTradeSocket;
// let marketTradeSocketChannel;

// Sagas Function for get Market Trade History list data by :Tejas Date : 14/9/2018
function* getMarketTradeHistory() {
    const error = [{ "error": "error" }];
    yield put(getMarketTradeHistoryFailure(error));
    // yield takeEvery(GET_MARKET_TRADE_HISTORY, getMarketTradeHistoryData)
}

// function for close socket connection when component unmount
function* closeSocketPairConnection({ payload }) {
    if (marketTradeSocket) {
        const { Pair } = payload;
        marketTradeSocket.emit('leave', Pair);
        marketTradeSocket.close();
    }

}

// function for close socket connection when component unmount call from component
function* closeMarketSocketConnection() {
    yield takeEvery(CLOSE_SOCKET_CONNECTION, closeSocketPairConnection)
}

function* changeMarketTradeSocketConnection() {
    const error = [{ "error": "error" }];
    yield put(getMarketTradeHistoryFailure(error));
    // yield takeEvery(CHANGE_MARKET_TRADE_HISTORY_SOCKET, changeMarketTradeSocketPairConnection)
}

// Function for root saga 
export default function* rootSaga() {
    yield all([
        fork(getMarketTradeHistory),
        fork(changeMarketTradeSocketConnection),
        fork(closeMarketSocketConnection),
    ]);
}