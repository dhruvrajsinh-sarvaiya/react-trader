// sagas For Buyer Order Actions By Tejas Date : 14/9/2018
// socket implement by devang parekh
// use : sagas is used to connect to socket and get records from their

// effects for redux-saga
import { all, call, fork, put, takeEvery, take } from "redux-saga/effects";
// types for set actions and reducers
import {
  CLOSE_SOCKET_CONNECTION,
} from "Actions/types";
// actions for set data or response
import {
  // getBuyerOrderListSuccess,
  getBuyerOrderListFailure
} from "Actions/Trade";
// event channel for socket connection to make channel between socket and front
// socket connection URL
//const buySocketServerURL = 'https://new-stack-node-socket.azurewebsites.net:3001';
// const buySocketServerURL = "http://172.20.65.131:3001";
let buySocket;
// let buySocketChannel;

// Sagas Function for get Buyer Order list (using socket connection) data by :Tejas Date : 14/9/2018
function* getBuyerOrder() {
  yield put(getBuyerOrderListFailure("error"));
  // yield takeEvery(GET_BUYER_ORDER_LIST, getBuyerOrderData);
}

// function for close socket connection when component unmount
function* closeSocketPairConnection({ payload }) {
  // check buy socket connection or not if yes then disconnect
  if (buySocket) {
    const { Pair } = payload;
    yield buySocket.emit("leave", Pair);
    buySocket.close();
  }
}

// function for close socket connection when component unmount call from component
function* closeBuySocketConnection() {
  yield takeEvery(CLOSE_SOCKET_CONNECTION, closeSocketPairConnection);
}


// when pair change call this function
function* changeBuyPairSocket() {
  yield put(getBuyerOrderListFailure("error"));
}

// Function for root saga
export default function* rootSaga() {
  yield all([
    fork(getBuyerOrder),
    fork(changeBuyPairSocket),
    fork(closeBuySocketConnection)
  ]);
}
