// component for Arbitrage trading Dashboard  by Devang parekh (26-07-2019)

import React from 'react';

//import comopnent for design
import { Button, Table } from 'reactstrap';

// used for convert messages in different langauages
import IntlMessages from "Util/IntlMessages";

// add constant to our file
import AppConfig from 'Constants/AppConfig';

//used for connect store 
import { connect } from "react-redux";

// used for select box
import Select from "react-select";

//actions for fetch data
import {
    getArbitragePairList,
    getArbitrageWalletList,
    arbitrageTradeOrder,
    arbitrageGetExchangeList
} from "Actions/Arbitrage";

// used for display notifications
import { NotificationManager } from "react-notifications";

// import for display Loader
import JbsLoader from "Components/JbsPageLoader/JbsLoader"

import JbsCollapsibleCard from 'Components/JbsCollapsibleCard/JbsCollapsibleCard';
//import $ from 'jquery';

import Slider from 'react-rangeslider'
import socketIOClient from "socket.io-client";
// import scrollbar
import { Scrollbars } from "react-custom-scrollbars";

const SocketURl = AppConfig.socketUrl;
let options = {
  exchanges: [ 'binance', 'bitfinex', 'hitbtc', 'coinex','poloniex','bitrex','okex','huobi','kraken'], 
  percent: 0,
  usdIsUsdt: false,
};
const exchanges = options.exchanges;
const greaterThan = options.percent || 0;

// class for dashboard
class ArbitrageTradingDashboard extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            pairList: [],
            currencyPair: AppConfig.defaultArbitragePair,
            firstCurrency: AppConfig.defaultArbitrageChildCurrency,
            secondCurrency: AppConfig.defaultArbitrageBasedCurrency,
            currencyPairID: 10021001,
            firstCurrencyBalance: 0,
            firstCurrencyWalletId: 0,
            secondCurrencyBalance: 0,
            secondCurrencyWalletId: 0,
            listExSmartArbitrage: [], 
            Wallet: [],
            selectedPer: 5,
            placeOrderBit: 0,
            arbitrageTradeOrderBit: 0,
            exchangeList:[],
            result : {},
            exchangeListWithLTP : [],
            exchangeArbitrageObject : {},
            exchangeListLPType:{},
            arbitrageExchangeUpdateBit:1, // hanlde socket connection and exchange list detail 
        }

        this.displaySmartArbitrage = 0;
        this.sockets = {};
    }

    handleOnChangeSlider = (value) => {
        if (this.state.selectedPer !== value) {
            this.setState({
                selectedPer: value
            })
        }
      }

    componentWillMount() {
        this.isComponentActive = 1;
    }

    // invoke After Compoent render
    componentDidMount() {
        //load Currency List        
        this.props.getArbitrageWalletList({});
        this.props.getArbitragePairList({});
        this.props.arbitrageGetExchangeList({ Pair: this.state.currencyPair })
        
    }

    componentWillUnmount() {
        this.isComponentActive = 0;
        this.displaySmartArbitrage = 0;
    }

    //handle onchange event of select box for set pair
    onChangePair(event) {

        var value = event.data;
        var pairs = "";

        if (value) {

            const oldPair = this.state.currencyPair;
            const pair = value.PairName;
            const pairId = value.PairId;
            const firstCurrency = value.Abbrevation;
            pairs = value.PairName;
            const tempSecondCurrency = value.PairName.split("_")[1];

            var firstCurrencyWalletId = 0;
            var secondCurrencyWalletId = 0;
            var secondCurrencyBalance = 0;
            var firstCurrencyBalance = 0;

            if (this.state.Wallet.length !== 0) {
                var secondCurrencyBal = this.state.Wallet.findIndex(wallet => wallet.CoinName === tempSecondCurrency && wallet.IsDefaultWallet == 1);
                var firstCurrencyBal = this.state.Wallet.findIndex(wallet => wallet.CoinName === firstCurrency && wallet.IsDefaultWallet == 1);

                if (secondCurrencyBal !== -1) {
                    secondCurrencyBalance = this.state.Wallet[secondCurrencyBal].Balance
                    secondCurrencyWalletId = this.state.Wallet[secondCurrencyBal].AccWalletID
                } else {
                    secondCurrencyBalance = 0
                    secondCurrencyWalletId = 0
                }

                if (firstCurrencyBal !== -1) {
                    firstCurrencyBalance = this.state.Wallet[firstCurrencyBal].Balance
                    firstCurrencyWalletId = this.state.Wallet[firstCurrencyBal].AccWalletID
                } else {
                    firstCurrencyBalance = 0
                    firstCurrencyWalletId = 0
                }

            }

            this.oldPairName = this.state.currencyPair;

            this.setState({
                firstCurrency: firstCurrency,
                currencyPair: pair,
                currencyPairID: pairId,
                secondCurrency: tempSecondCurrency,
                firstCurrencyWalletId: firstCurrencyWalletId,
                secondCurrencyWalletId: secondCurrencyWalletId,
                secondCurrencyBalance: secondCurrencyBalance,
                firstCurrencyBalance: firstCurrencyBalance,
                pairChangeBit:++this.state.pairChangeBit
            });

            this.props.arbitrageGetExchangeList({ Pair: pair })

        }

    }

    // invoke when component recive props
    componentWillReceiveProps(nextprops) {
        
        if (nextprops.arbitrageExchange && nextprops.arbitrageExchange.length && nextprops.arbitrageExchangeUpdateBit !== this.state.arbitrageExchangeUpdateBit) {

            var exchangeList = {},exchangeListLPType = {},LpType = 1;
			nextprops.arbitrageExchange.map((exchange) => {
                exchangeListLPType[exchange.ProviderName.toLowerCase()] = exchange.LPType;
				exchangeList[exchange.ProviderName.toLowerCase()] = {};				
            });
            /*exchanges.map((exchange) => {
                exchangeList[exchange] = {};
                exchangeListLPType[exchange] = LpType++;
            });*/
            
            this.exchangeList = exchangeList;
            this.displaySmartArbitrage = 1;
            
            //disconnect from server
            if(Object.keys(this.sockets).length) {
                Object.keys(this.sockets).map((ProviderName) => {
                    this.sockets[ProviderName].disconnect();
                });
                this.sockets = {};
            }

            this.setState({
                exchangeList: nextprops.arbitrageExchange,
                exchangeArbitrageObject:{},
                exchangeListLPType:exchangeListLPType,
                pairChangeBit:this.pairChangeBit,
                arbitrageExchangeUpdateBit:nextprops.arbitrageExchangeUpdateBit
            });

            // call connect and set intial exchange detail and connect mulitple sokcet based on exchange list
            this.connectWebSocket();

        } else if(nextprops.arbitrageExchangeUpdateBit !== this.state.arbitrageExchangeUpdateBit){

            //disconnect from server
            if(Object.keys(this.sockets).length) {
                Object.keys(this.sockets).map((ProviderName) => {
                    this.sockets[ProviderName].disconnect();
                });
                this.sockets = {};
            }

            this.setState({
                exchangeList: [],
                exchangeArbitrageObject:{},
                exchangeListLPType:{},
                pairChangeBit:this.pairChangeBit,
                arbitrageExchangeUpdateBit:nextprops.arbitrageExchangeUpdateBit
            })

            this.exchangeList = [];
            this.displaySmartArbitrage = 0;

        }
        
        if (nextprops.pairList.length && nextprops.pairList !== null && nextprops.pairList !== this.state.pairList) {

            // set Currency list if gets from API only          
            nextprops.pairList.map((item) => {
                item.PairList.map((pairItem) => {
                    if (AppConfig.defaultArbitragePair === pairItem.PairName) {
                        this.setState({
                            pairList: nextprops.pairList,
                            showLoader: false,
                            secondCurrency: item.Abbrevation,
                            firstCurrency: pairItem.Abbrevation,
                            currencyPair: AppConfig.defaultArbitragePair,
                            currencyPairID: pairItem.PairId
                        });
                    }
                })
            });

        }

        if (nextprops.wallet && nextprops.wallet !== null) {
            if (nextprops.wallet.length !== 0) {
                nextprops.wallet.map(value => {
                    if (this.state.secondCurrency === value.CoinName) {
                        this.setState({
                            secondCurrencyBalance: value.Balance,
                            secondCurrencyWalletId: value.AccWalletID
                        });
                    }

                    if (this.state.firstCurrency === value.CoinName) {
                        this.setState({
                            firstCurrencyBalance: value.Balance,
                            firstCurrencyWalletId: value.AccWalletID
                        });
                    }
                });
            }

            this.setState({ Wallet: nextprops.wallet });
        }

        if (this.state.arbitrageTradeOrderBit !== nextprops.arbitrageTradeOrderBit && nextprops.arbitrageTradeOrder) {

            if (nextprops.arbitrageTradeOrder.statusCode == 200 && nextprops.arbitrageTradeOrder.ErrorCode == 4566) {
                NotificationManager.success(<IntlMessages id={`trading.orders.orders.trnid`} values={nextprops.arbitrageTradeOrder.response} />);
            } else if (nextprops.arbitrageTradeOrder.statusCode == 200 && nextprops.arbitrageTradeOrder.ErrorCode == 4568) {
                NotificationManager.error(<IntlMessages id="error.trading.transaction.4568" />)
            }

            this.setState({
                arbitrageTradeOrderBit: nextprops.arbitrageTradeOrderBit,
                placeOrderBit: 0
            })

        }
    }

    // used for place order
    TradeOrder = (event, record, firstBal) => {
        
        event.preventDefault();

        var MultipleOrderList = [], checked = 0;

        if (record && record.ProviderBuy) {

            if ((checked === 0) && (this.state.currencyPairID === '' || typeof this.state.currencyPairID === undefined || this.state.currencyPairID === 0)) {

                checked = 1
                NotificationManager.error(<IntlMessages id="error.trading.transaction.4601" />);

            } else if ((checked === 0) && (this.state.secondCurrencyWalletId === '' || typeof this.state.secondCurrencyWalletId === undefined || this.state.secondCurrencyWalletId === 0)) {

                checked = 1
                NotificationManager.error(<IntlMessages id="error.trading.creditwallet" />);

            } else if ((checked === 0) && (this.state.firstCurrencyWalletId === '' || typeof this.state.firstCurrencyWalletId === undefined || this.state.firstCurrencyWalletId === 0)) {

                checked = 1
                NotificationManager.error(<IntlMessages id="error.trading.debitwallet" />);

            } else {
                if (checked === 0) {
                    const data = {
                        currencyPairID: this.state.currencyPairID,
                        debitWalletID: this.state.secondCurrencyWalletId,
                        creditWalletID: this.state.firstCurrencyWalletId,
                        feePer: 0,
                        fee: 0,
                        trnMode: 11,
                        price: record.ProviderBuy.LTP,
                        amount: firstBal,
                        total: record.ProviderBuy.LTP * firstBal,
                        ordertype: 1,
                        orderSide: 4,
                        StopPrice: 0,
                        nonce: "54545454",
                        Pair: this.state.firstCurrency + '_' + this.state.secondCurrency,
                        marginOrder: this.props.marginTrading,
                        RouteID: 1,
                        LPType: record.ProviderBuy.LPType
                    }

                    MultipleOrderList.push(data)
                }
            }

        }

        if (record && record.ProviderSELL) {

            if ((checked === 0) && (this.state.currencyPairID === '' || typeof this.state.currencyPairID === undefined || this.state.currencyPairID === 0)) {

                checked = 1
                NotificationManager.error(<IntlMessages id="error.trading.transaction.4601" />);

            } else if ((checked === 0) && (this.state.secondCurrencyWalletId === '' || typeof this.state.secondCurrencyWalletId === undefined || this.state.secondCurrencyWalletId === 0)) {

                checked = 1
                NotificationManager.error(<IntlMessages id="error.trading.creditwallet" />);

            } else if ((checked === 0) && (this.state.firstCurrencyWalletId === '' || typeof this.state.firstCurrencyWalletId === undefined || this.state.firstCurrencyWalletId === 0)) {

                checked = 1
                NotificationManager.error(<IntlMessages id="error.trading.debitwallet" />);

            } else {

                if (checked === 0) {
                    const data = {
                        currencyPairID: this.state.currencyPairID,
                        debitWalletID: this.state.firstCurrencyWalletId,
                        creditWalletID: this.state.secondCurrencyWalletId,
                        feePer: 0,
                        fee: 0,
                        trnMode: 11,
                        price: record.ProviderSELL.LTP,
                        amount: firstBal,
                        total: record.ProviderSELL.LTP * firstBal,
                        ordertype: 1,
                        orderSide: 5,
                        StopPrice: 0,
                        nonce: "54545454",
                        Pair: this.state.firstCurrency + '_' + this.state.secondCurrency,
                        marginOrder: this.props.marginTrading,
                        RouteID: 1,
                        LPType: record.ProviderSELL.LPType
                    }

                    MultipleOrderList.push(data)
                }
            }
        }

        if (MultipleOrderList && MultipleOrderList.length) {
            const payload = {
                MultipleOrderList: MultipleOrderList,
                Pair: this.state.firstCurrency + '_' + this.state.secondCurrency
            }

            this.setState({
                placeOrderBit: 1,
            })

            this.props.arbitrageTradeOrder(payload);
        }

    }

    changeProfitPer = (value) => {

        if (this.state.selectedPer !== value) {
            this.setState({
                selectedPer: value
            })
        }

    }

    // function for connect web socket
    connectWebSocket() {
        
		var self = this;
        
        // make proper list of all exchnages with new object sell and profit param
        let tempMainObject = [];
        Object.keys(this.exchangeList).map((mainExchange)=> {

            let tempObject = [];
            tempMainObject[mainExchange] = {};
            Object.keys(this.exchangeList).map((subExchange)=> {

                if(mainExchange != subExchange){
                    tempObject.push({ 'sell' : subExchange, profit : 0.00});
                }

            });

            tempMainObject[mainExchange] = tempObject;

        });
        
        // store into result state
        this.state.result = tempMainObject;
                
        // code for connect socket dynamically which is stored in exchange list array
		Object.keys(self.exchangeList).map((ProviderName) => {
			
			//this.sockets[ProviderName] = socketIOClient(SocketURl+ProviderName,{query:{pair:this.state.currencyPair}});
			//this.sockets[ProviderName].on(ProviderName+this.state.currencyPair.split('_').join(''), async (data) => {
            this.sockets[ProviderName] = socketIOClient(SocketURl+ProviderName,{query:{pair:this.state.currencyPair === 'BTC_USD' ? 'BTC_USDT' : this.state.currencyPair,channelID:AppConfig.tickerChannelID}});
			this.sockets[ProviderName].on(ProviderName+(this.state.currencyPair === 'BTC_USD' ? 'BTC_USDT' : this.state.currencyPair).split('_').join(''), async (data) => {

                if(this.displaySmartArbitrage) {
                    this.exchangeList[ProviderName] = data;
                    this.setState({exchangeListWithLTP : this.exchangeList});
                    this.cryptoExchangeArbitrage();
                }

			});

        });
        
    }

    // code for make proper list with data for all exchanges
    cryptoExchangeArbitrage(){
    
        // make proper data into promises for proper LP wise detail
        const promises = Object.keys(this.exchangeList).map((ProviderName) => {
            return {id: ProviderName, data: this.state.exchangeListWithLTP[ProviderName]};
        });
    
        // after complete above process call reduce or make list for smart exchanges with profit and other detail
        Promise.all(promises).then((allExchanges) => {
            this.reduceExchCompares(allExchanges);
        }).catch(e => {
            console.log(e);
        });
    
    };

    // function for compair each exchange internally
    reduceExchCompares(allExchanges){
    
        const alreadyChecked = [];
    
        // process for compair each exchange internal for making pair with profit and for trade order
        Object.keys(allExchanges).map((mainExchange)=> {

            Object.keys(allExchanges).map((subExchange)=> {

                if(Object.keys(allExchanges[mainExchange].data) && Object.keys(allExchanges[subExchange].data)) {

                    const joinedExchanges = allExchanges[mainExchange].id + (allExchanges[subExchange].id);
                    const joinedExchanges2 = allExchanges[subExchange].id + (allExchanges[mainExchange].id);

                    if (allExchanges[mainExchange].id === allExchanges[subExchange].id || alreadyChecked.indexOf(joinedExchanges) > -1 || alreadyChecked.indexOf(joinedExchanges2) > -1) {
                        
                    } else {

                        alreadyChecked.push(joinedExchanges, joinedExchanges2);
        
                        const exchName1 = allExchanges[mainExchange].id;
                        const exchName2 = allExchanges[subExchange].id;
                
                        const exch1 = allExchanges[mainExchange].data;
                        const exch2 = allExchanges[subExchange].data;
                        
                        // call to make a smart arbitrage list for placing order
                        this.getTickerArbitrage(exchName1, exchName2, exch1, exch2);
                        
                    }

                }

            });

        });

    }; 

    // function is used for handle and make a list for smart arbitrage exchange pair list
    getTickerArbitrage(exchName1, exchName2, exch1, exch2) {
        
        if(exch1 >= 0 || exch2 >= 0){
            return true;
        } else {
        
            if(typeof(exch1.bid) == 'undefined' || typeof(exch2.ask) == 'undefined'){
                return true;
            }

            const exch1ToExch2 = (exch2.last / exch1.last)*100;
            const exch2ToExch1 = (exch1.last / exch2.last)*100;

            const percentDiff = 100 + greaterThan;
            
            let arbitragePercent;
            let arbitrageObject;
            
            if(exch1ToExch2 >= percentDiff && exch1.last > 0) {
    
                arbitragePercent = exch1ToExch2 - 100
    
                // with ask bid process
                /* arbitrageObject = {
                  arbitragePercent: (exch1ToExch2 - 100).toFixed(2),
                  symbol: exchange1,
                  buyAt: exchName1,
                  sellAt: exchName2,
                  buyAsk: exch1.ask,
                  sellBid: exch2.bid,
                  buyAskQty: exch1.askQty,
                  sellBidQty: exch2.BidQty,
                  buyInfo: exch1,
                  sellInfo: exch2,
                }; */

                // with last price process
                /* arbitrageObject = {
                    arbitragePercent: exch1ToExch2, // (exch1ToExch2 - 100).toFixed(2),
                    //arbitragePercent: (exch1ToExch2 - 100).toFixed(2),
                    symbol: exchange1,
                    buyAt: exchName1,
                    sellAt: exchName2,
                    //buyAsk: exch1.ask,
                    buyAsk: exch1.last,
                    //sellBid: exch2.bid,
                    sellBid: exch2.last,
                    buyLast: exch1.last,
                    sellLast: exch2.last,
                    buyAskQty: exch1.askQty,
                    sellBidQty: exch2.BidQty,
                    buyInfo: exch1,
                    sellInfo: exch2,
                }; */

                // make proper object same as APi response
                arbitrageObject = {
                    Pair: this.state.currencyPair,
                    GrossProfitPer: arbitragePercent,
                    NetProfitPer: arbitragePercent, // need to minus fees
                    GrossProfitValue: exch2.last-exch1.last,
                    NetProfitValue: exch2.last-exch1.last,
                    ProviderBuy: {
                      ProviderName: exchName1,
                      LPType: this.state.exchangeListLPType[exchName1],
                      LTP: parseFloat(exch1.last)
                    },
                    ProviderSELL: {
                      ProviderName: exchName2,
                      LPType: this.state.exchangeListLPType[exchName2],
                      LTP: parseFloat(exch2.last)
                    }
                };

                let tempObject = this.state.result;
                
                for(let key1 in tempObject[exchName1]) {
                    if(tempObject[exchName1][key1].sell == exchName2){
                        tempObject[exchName1][key1].profit = parseFloat(arbitrageObject.NetProfitPer);
                        tempObject[exchName1][key1].object = arbitrageObject;
                    }
                }

                this.state.result = tempObject;
    
            } else if(exch2ToExch1 >= percentDiff && exch2.ask > 0) {
    
                arbitragePercent = exch2ToExch1 - 100
    
                // process with ask bid price 
                /* arbitrageObject = {
                  arbitragePercent: (exch2ToExch1 - 100).toFixed(2),
                  symbol: exchange2,
                  buyAt: exchName2,
                  sellAt: exchName1,
                  buyAsk: exch2.ask,
                  sellBid: exch1.bid,
                  buyAskQty: exch2.askQty,
                  sellBidQty: exch1.BidQty,
                  buyInfo: exch2,
                  sellInfo: exch1,
                }; */
                
                // process with last price
                /* arbitrageObject = {
                    arbitragePercent: exch2ToExch1, //(exch2ToExch1 - 100).toFixed(2),
                    symbol: exchange2,
                    buyAt: exchName2,
                    sellAt: exchName1,
                    //buyAsk: exch1.ask,
                    buyAsk: exch1.last,
                    //sellBid: exch2.bid,
                    sellBid: exch2.last,
                    buyLast: exch2.last,
                    sellLast: exch1.last,
                    buyAskQty: exch2.askQty,
                    sellBidQty: exch1.BidQty,
                    buyInfo: exch2,
                    sellInfo: exch1,
                  }; */

                // make proper object same as APi response
                arbitrageObject = {
                    Pair: this.state.currencyPair,
                    GrossProfitPer: arbitragePercent,
                    NetProfitPer: arbitragePercent, // need to minus fees
                    GrossProfitValue: exch1.last - exch2.last,
                    NetProfitValue: exch1.last - exch2.last,
                    ProviderBuy: {
                      ProviderName: exchName2,
                      LPType: this.state.exchangeListLPType[exchName2],
                      LTP: parseFloat(exch2.last)
                    },
                    ProviderSELL: {
                      ProviderName: exchName1,
                      LPType: this.state.exchangeListLPType[exchName1],
                      LTP: parseFloat(exch1.last)
                    }
                };

                let tempObject = this.state.result;
                
                for(let key1 in tempObject[exchName2]) {
                    if(tempObject[exchName2][key1].sell == exchName1){
                        tempObject[exchName2][key1].profit = parseFloat(arbitrageObject.NetProfitPer);
                        tempObject[exchName2][key1].object = arbitrageObject;
                    }
                }

                this.state.result = tempObject;

            } else {
                return true;
            };
            
        }
       
    };    
    
    
    _beautifyResponse(data) {
        if (_.isArray(data)) {
            return _.map(data, event => {
                if (event.e) {
                    return this._beautifier.beautify(event, event.e + 'Event');
                }
                return event;
            });
        } else if (data.e) {
            return this._beautifier.beautify(data, data.e + 'Event');
        }
        return data;
    }

    //renders the component
    render() {

        const { pairList, result } = this.state;
		
        const exchangeArbitrageObject = [];
        
		for(let key1 in result) {
			
			const resultItem = result[key1];
			for(let key2 in resultItem) {
				
				if(resultItem[key2].profit > 0){
					exchangeArbitrageObject.push(resultItem[key2]);
				}
			}
		}
		
        //exchangeArbitrageObject.sort();
        exchangeArbitrageObject.sort(function (a, b) {
			return parseFloat(b.object.NetProfitPer) - parseFloat(a.object.NetProfitPer)
        })
        
        const pairListData = [];
        pairList && pairList.map((item, key) => {
            item.PairList && item.PairList.map((pair, index) => {
                pairListData.push(pair)
            });
        });
		
        return (
            <JbsCollapsibleCard
                colClasses="todo-wrapper"
                fullBlock
                customClasses="overflow-hidden"
            >
                <div className="container arbitrage-trading mt-30 mb-30">
                    {(this.props.pairListDataLoading || this.props.loading || this.props.loader || this.props.arbitrageExchangeLoading) && <JbsLoader />}
                    <div className="row">
                        <div className="col-md-2 mt-20">
                            <h2 className="ml-5">
                                {/* Smart Arbitrage */}
                                <IntlMessages id="sidebar.arbitrageTrading" />
                            </h2>
                        </div>
                        <div className="col-md-3 mt-15">
                            <Select className="r_sel_20 mb-5"
                                //value={this.props.currencyPair === null ? null : ({ label: this.state.currencyPair })}
                                value={this.state.currencyPair === null ? null : ({ label: this.state.currencyPair.split("_")[0] + " / " + this.state.currencyPair.split("_")[1] })}
                                options={pairListData.map((item) => ({
                                    value: item.PairId,
                                    label: item.PairName,
                                    data: item
                                }))}
                                onChange={(e) => this.onChangePair(e)}
                                isClearable={false}
                                maxMenuHeight={200}
                                placeholder={<IntlMessages id="sidebar.searchdot" />}
                            />

                        </div>

                        <div className="col-md-5 calulcate-trading mt-5">
                            <IntlMessages id="sidebar.arbitrageTradingBalance" />           
                            <Slider
                            className="arbitrage_slider_box"
                                value={this.state.selectedPer}
                                orientation="horizontal"
                                onChange={this.handleOnChangeSlider}
                                min={5}
                                max={85}
                                step={20}
                                tooltip={true}
                                //handleLabel={this.state.selectedPer}                                                                                               
                                labels={ {5: '5', 25:"25",45:"45",65:"65",85: '85'}}
                                //handleLabel={String}
                            />      
                                       
                            {/* <span>
                                <Button
                                    value="5"
                                    className={classnames(
                                        { activeBtn: this.state.selectedPer === 5 },
                                        "btn-per m-2 btn btn-primary"
                                    )}
                                    onClick={event => {
                                        this.changeProfitPer(5);
                                    }}
                                >
                                    5%
                    </Button>

                                <Button
                                    value="15"
                                    className={classnames(
                                        { activeBtn: this.state.selectedPer === 15 },
                                        "btn-per m-2 btn btn-primary"
                                    )}
                                    onClick={event => {
                                        this.changeProfitPer(15);
                                    }}
                                >
                                    15%
                    </Button>

                                <Button
                                    value="25"
                                    className={classnames(
                                        { activeBtn: this.state.selectedPer === 25 },
                                        "btn-per m-2 btn btn-primary"
                                    )}
                                    onClick={event => {
                                        this.changeProfitPer(25);
                                    }}
                                >
                                    25%
                    </Button>


                                <Button
                                    value="50"
                                    className={classnames(
                                        { activeBtn: this.state.selectedPer === 50 },
                                        "btn-per m-2 btn btn-primary"
                                    )}
                                    onClick={event => {
                                        this.changeProfitPer(50);
                                    }}
                                >
                                    50%
                    </Button>


                                <Button
                                    value="70"
                                    className={classnames(
                                        { activeBtn: this.state.selectedPer === 70 },
                                        "btn-per m-2 btn btn-primary"
                                    )}
                                    onClick={event => {
                                        this.changeProfitPer(70);
                                    }}
                                >
                                    70%
                    </Button>


                                <Button
                                    value="90"
                                    className={classnames(
                                        { activeBtn: this.state.selectedPer === 90 },
                                        "btn-per m-2 btn btn-primary"
                                    )}
                                    onClick={event => {
                                        this.changeProfitPer(90);
                                    }}
                                >
                                    90%
                    </Button>

                            </span> */}
                        </div>

                        <div className="col-md-2 mt-20">
                            {/* <IntlMessages id="wallet.AGAvailableBalance" /> */}
                            <span className="text-right">
                                {this.state.firstCurrencyBalance.toFixed(8) + " " + this.state.firstCurrency}  <i className="zmdi zmdi-balance-wallet ml-10" /><br />
                                {this.state.secondCurrencyBalance.toFixed(8) + " " + this.state.secondCurrency}  <i className="zmdi zmdi-balance-wallet ml-10" />
                            </span>
                        </div>
                    </div>

                    <div>

                    <div className="row mt-10 mb-10" style={{borderBottom: "1px solid"}}>
                        <div className="col-md-2 font-weight-bold text-center">
                            <IntlMessages id="sidebar.colProfit" />
                        </div>

                        <div className="col-md-3 font-weight-bold text-center">
                            <IntlMessages id="sidebar.arbiTrageBuyFrom" />
                        </div>

                        <div className="col-md-3 font-weight-bold text-center">
                            <IntlMessages id="sidebar.arbiTrageSellTO" />
                        </div>

                        <div className="col-md-2 font-weight-bold text-center">
                            <IntlMessages id="sidebar.arbitrageBalanceTo" />
                        </div>

                        <div className="col-md-2 font-weight-bold text-center">
                            <IntlMessages id="widgets.action" />
                        </div>

                    </div>
                    
                    <Scrollbars
                            className="jbs-scroll"
                            autoHeight
                            autoHeightMin={300}
                            autoHeightMax={300}
                            autoHide
                        >
                        
                        {exchangeArbitrageObject && exchangeArbitrageObject.length
                            ?
                            exchangeArbitrageObject.map((item, key) => {

                                var arbitrageDetail = item.object;
                                
                                var secondBal = parseFloat(parseFloat(this.state.secondCurrencyBalance * this.state.selectedPer) / 100).toFixed(8)
                                if (this.state.secondCurrencyBalance === 0) {
                                    var firstBal = this.state.firstCurrencyBalance;
                                    secondBal = 0;
                                } else {
                                    var firstBal = secondBal / arbitrageDetail.ProviderBuy.LTP;
                                }


                                return <div key={key} className="card d-flex m-5 p-10 mb-10">
                                    <div className="row">

                                        <div className="col-md-2 text-center">
                                            <div style={{ display: "grid" }}>
                                                {arbitrageDetail.NetProfitPer && arbitrageDetail.NetProfitPer.toFixed(2)} % {" "}{arbitrageDetail.Pair.split("_")[1]}
                                                {(firstBal != 0 && secondBal != 0 && firstBal <= this.state.firstCurrencyBalance && secondBal <= this.state.secondCurrencyBalance && this.state.firstCurrencyBalance !== 0 && this.state.secondCurrencyBalance !== 0) &&
                                                    <span className={arbitrageDetail.NetProfitPer > 0 ? "text-success" : "text-danger"}>{parseFloat(arbitrageDetail.NetProfitValue*firstBal).toFixed(8)}{" "}{arbitrageDetail.Pair.split("_")[1]}</span>
                                                }
                                            </div>
                                        </div>

                                        <div className="col-md-3 text-center" style={{ display: "grid" }}>
                                            <div className="font-weight-bold">
                                              {/*   <img
                                                        src={require('Assets/img/MyAccount/'+ arbitrageDetail.ProviderBuy.ProviderName + '.png')}
                                                        className="mr-5 mb-1"
                                                        height="25px"
                                                        width="25px"
                                                        alt={arbitrageDetail.ProviderBuy.ProviderName}                                               
                                                    /> */}
                                                {arbitrageDetail.ProviderBuy.ProviderName}
                                            </div>    
                                            <div className="font-weight-bold text-success">                                             
                                                {arbitrageDetail.ProviderBuy && arbitrageDetail.ProviderBuy.LTP.toFixed(8)}
                                            </div>   
                                        </div>

                                        <div className="col-md-3 text-center" style={{ display: "grid" }}>
                                              <div className="font-weight-bold ">
                                                {/* <img
                                                        src={require('Assets/img/MyAccount/'+ arbitrageDetail.ProviderSELL.ProviderName + '.png')}
                                                        className="mr-5 mb-1"
                                                        height="25px"
                                                        width="25px"
                                                        alt={arbitrageDetail.ProviderSELL.ProviderName}                                               
                                                    /> */}
                                                {arbitrageDetail.ProviderSELL.ProviderName}
                                            </div>  
                                            <div className="font-weight-bold text-danger" >                                             
                                                {arbitrageDetail.ProviderSELL && arbitrageDetail.ProviderSELL.LTP.toFixed(8)}
                                            </div>  
                                        </div>

                                      {/*   <div className="col-md-3 " style={{ display: "grid" }}>

                                            <div className="font-weight-bold text-success">                                             
                                                {arbitrageDetail.ProviderBuy && arbitrageDetail.ProviderBuy.LTP.toFixed(8)}
                                            </div>   

                                            <div className="font-weight-bold text-danger " >                                             
                                                {arbitrageDetail.ProviderSELL && arbitrageDetail.ProviderSELL.LTP.toFixed(8)}
                                            </div>  

                                        </div> */}

                                       

                                        {(firstBal != 0 && secondBal != 0 && firstBal <= this.state.firstCurrencyBalance && secondBal <= this.state.secondCurrencyBalance && this.state.firstCurrencyBalance !== 0 && this.state.secondCurrencyBalance !== 0) &&

                                            <div style={{ display: "grid" }} className="col-md-2 text-center">

                                                <span>
                                                    {firstBal && firstBal.toFixed(8)}
                                                    {" "} {this.state.firstCurrency}
                                                </span>
                                                <span>
                                                    {secondBal && secondBal}
                                                    {" "} {this.state.secondCurrency}
                                                </span>
                                                
                                            </div>

                                        }

                                        {(firstBal != 0 && secondBal != 0 && firstBal <= this.state.firstCurrencyBalance && secondBal <= this.state.secondCurrencyBalance && this.state.firstCurrencyBalance !== 0 && this.state.secondCurrencyBalance !== 0) &&
                                            <div className="col-md-2 text-center pt-10">
                                                <div>
                                                    {arbitrageDetail.NetProfitPer > 0 ?
                                                        <Button
                                                            //color="primary"
                                                            varient="raised"
                                                            className="border-0 rounded-0 perverbtn txt"
                                                            onClick={(event) => { this.TradeOrder(event, arbitrageDetail, firstBal) }}
                                                        >
                                                            <IntlMessages id="button.trade" />
                                                        </Button>
                                                        :
                                                        '-'
                                                    }
                                                </div>
                                            </div>
                                        }

                                        {(firstBal > this.state.firstCurrencyBalance || secondBal > this.state.secondCurrencyBalance || this.state.firstCurrencyBalance === 0 || this.state.secondCurrencyBalance === 0) &&
                                            <div className="col-md-4 text-danger text-center pt-20">
                                                    { ((!firstBal || firstBal > this.state.firstCurrencyBalance) &&
                                                        (!secondBal || secondBal > this.state.secondCurrencyBalance)) ?

                                                        <IntlMessages id={`sidebar.arbiTragePleaseAddBoth`}
                                                            values={{
                                                                Param1: arbitrageDetail.Pair.split("_")[0],
                                                                Param2: arbitrageDetail.Pair.split("_")[1]
                                                            }} />
                                                        : (!firstBal || firstBal > this.state.firstCurrencyBalance) ?

                                                            <IntlMessages id={`sidebar.arbiTragePleaseAdd`} values={{ Param1: arbitrageDetail.Pair.split("_")[0] }} />
                                                            : (!secondBal || secondBal > this.state.secondCurrencyBalance) ?

                                                                <IntlMessages id={`sidebar.arbiTragePleaseAdd`} values={{ Param1: arbitrageDetail.Pair.split("_")[1] }} />
                                                                : ''
                                                    }
                                            </div>
                                        }
                                    
                                    </div>
                                    
                                </div>
                            })
                            :
                            // <tr><td colSpan="6"><IntlMessages id="trading.activeorders.label.nodata" /></td></tr>
                            <div className="text-center">
                                <IntlMessages id="trading.activeorders.label.nodata" />
                            </div>
                        }
                    </Scrollbars>
                    </div>
                </div>
            </JbsCollapsibleCard>
        )
    }
}


const mapStateToProps = state => ({
    //pairList: state.tradePairList.pairList,
    wallet: state.ArbitrageWalletReducer.walletList,
    loading: state.ArbitrageWalletReducer.loading || state.ArbitrageTrading.loading ? true : false,
    pairList: state.arbitrageOrderBook.arbitragePairList,
    pairListDataLoading: state.arbitrageOrderBook.pairListDataLoading,
    loader: state.ArbitrageTrading.arbiTrageTradeOrderLoader,
    arbitrageTradeOrder: state.ArbitrageTrading.arbitrageTradeOrder,
    arbitrageTradeOrderError: state.ArbitrageTrading.arbitrageTradeOrderError,
    arbitrageTradeOrderBit: state.ArbitrageTrading.arbitrageTradeOrderBit,
    arbitrageExchange: state.ArbitrageExchange.arbitrageExchange,
    arbitrageExchangeLoading: state.ArbitrageExchange.arbitrageExchangeLoading,
    arbitrageExchangeUpdateBit:state.ArbitrageExchange.arbitrageExchangeUpdateBit
});

export default connect(mapStateToProps, {
    getArbitragePairList,
    arbitrageGetExchangeList,
    getArbitrageWalletList,
    arbitrageTradeOrder
})(ArbitrageTradingDashboard);