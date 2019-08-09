// sagas For Seller Order Actions By Tejas Date : 14/9/2018
// socket implement by devang parekh
// use : sagas is used to connect to socket and get records from their

// effects for redux-saga
import { all, call, fork, put, takeEvery, take } from 'redux-saga/effects';

// types for set actions and reducers
import {
    // GET_SELLER_ORDER_LIST,
    // CHANGE_SELL_PAIR_SOCKET,
    CLOSE_SOCKET_CONNECTION
} from 'Actions/types';

// action sfor set data or response
import {
    // getSellerOrderListSuccess,
    getSellerOrderListFailure,
} from 'Actions/Trade';

// event channel for socket connection to make channel between socket and front
// socket connection URL
//const sellSocketServerURL = 'https://new-stack-node-socket.azurewebsites.net:3002';
// const sellSocketServerURL = 'http://172.20.65.131:3002';
let sellSocket;
// let sellSocketChannel;



// Sagas Function for get Seller Order list data by :Tejas Date : 14/9/2018
function* getSellerOrder() {
    const error = [{ "error": "error" }];
    yield put(getSellerOrderListFailure(error));
    // yield takeEvery(GET_SELLER_ORDER_LIST, getSellerOrderData)
}

// function for close socket connection when component unmount
function* closeSocketPairConnection({ payload }) {
    if (sellSocket) {
        const { Pair } = payload;
        sellSocket.emit('leave', Pair);
        sellSocket.close();
    }

}

// function for close socket connection when component unmount call from component
function* closeSellSocketConnection() {
    yield takeEvery(CLOSE_SOCKET_CONNECTION, closeSocketPairConnection)
}

function* changeSellPairSocket() {
    const error = [{ "error": "error" }];
    yield put(getSellerOrderListFailure(error));
    // yield takeEvery(CHANGE_SELL_PAIR_SOCKET, changeSellPairSocketConnection)
}

// Function for root saga 
export default function* rootSaga() {
    yield all([
        fork(getSellerOrder),
        fork(changeSellPairSocket),
        fork(closeSellSocketConnection),
    ]);
}