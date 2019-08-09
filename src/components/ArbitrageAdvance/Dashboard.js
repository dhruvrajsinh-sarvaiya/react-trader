/**
 * Author : Salim Deraiya
 * Created : 27/05/2019
 *  Arbitrage Dashboard
 * changed by Tejas 
*/
import React, { Component, Fragment } from 'react';

// used for connect to store
import { connect } from "react-redux";

// import components
import {
    BuySellTrade,
    ExchangeList,    
    OrderTabList,
    PairSelection,
} from "Components/ArbitrageAdvance";

//import actions
import {
    getArbitragePairList,
    getArbitrageChartData,
    atbitrageBuyerBook,
    atbitrageSellerBook,
    getArbitrageWalletList,
    arbitrageMarketTradeHistory,
    arbitrageGetExchangeList
} from "Actions/Arbitrage";

// used for constants
import AppConfig from 'Constants/AppConfig';

// import for used jquery
import $ from 'jquery';

import {
    getCurrencyList,    
} from 'Actions/Trade';

// intl messages
import IntlMessages from "Util/IntlMessages";
import { Modal, ModalHeader, ModalBody, ModalFooter,Button } from "reactstrap"; // added by devang parekh (19-6-2019) for display modal

import socketIOClient from "socket.io-client";
const SocketURl = AppConfig.socketUrl;

// email promotion class
class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstCurrency: AppConfig.defaultArbitrageChildCurrency,
            secondCurrency: AppConfig.defaultArbitrageBasedCurrency,
            currencyPair: AppConfig.defaultArbitragePair,
            firstCurrencyBalance: 0,
            firstCurrencyWalletId: 0,
            secondCurrencyBalance: 0,
            secondCurrencyWalletId: 0,
            UpDownBit: 0,
            hubConnection: this.props.location.state.hubConnection,
            Wallet: [],
            isComponentActive: 1,
            showLoader: true,
            socketBuyData: [],
            pairList: [],
            bulkBuyOrder: [],
            bulkSellOrder: [],
            currencyPairID: 10021001,
            takersValue: 0,
            makersValue: 0,
            pairId: '',
            isBulkBuyOrder: false,
            isBulkSellOrder: false,
            isBothOrder:false,            
            isShowModal : false, // aded by devang parekh for modal default false
            formType: 1,
            exchangeList:[],
            buyOrderBit: 0,
            priceLength:0,
            amtLength:0,
            qtyLength:0,
        };

        this.exchangeList = [];
		this.sockets = {};
        this.displayArbitrage = 0;
        
    }

    // invoke After Compoent render
    componentDidMount() {
        //load Currency List        
        this.props.getCurrencyList();

        this.props.getArbitrageWalletList({});
    }

    // invoke before Compoent render
    componentWillMount() {
        
        // added by devang parekh (19-6-2019) check bit if priviously agree or not
        var accessPer = localStorage.getItem("_SmartTrading");
        if(accessPer === undefined || accessPer === null || !accessPer) {
            this.setState({ isShowModal: true });
        }
        //end

        const self = this;
        //load Currency List
        this.props.getArbitragePairList({});

        /*self.state.hubConnection.on("RecieveTradeHistoryArbitrage", (tradeHistoryDetail) => {          
        });

        self.state.hubConnection.onclose(e => {
            setTimeout(function () {
                window.JbsHorizontalLayout.props.location.state.connectSignalR(self.state.currencyPair, self.state.secondCurrency);
            }, 1000);
        });*/

        self.state.hubConnection.on('RecieveWalletBalArbitrage', (walletBalance) => {            
            try {
                walletBalance = JSON.parse(walletBalance);
                if (self.state.isComponentActive === 1 && typeof walletBalance.Data !== 'undefined' && walletBalance.Data !== '') {
                    if ((walletBalance.EventTime && self.state.socketBuyData.length === 0) ||
                        (self.state.socketBuyData.length !== 0 && walletBalance.EventTime >= self.state.socketBuyData.EventTime)) {
                        const walletCoinDetail = walletBalance.Data;
                        if (walletCoinDetail.CoinName !== '') {
                            var walletList = $.extend(true, [], self.state.Wallet);
                            walletList.map((value, key) => {
                                if (value.CoinName === walletCoinDetail.CoinName && value.AccWalletID === walletCoinDetail.AccWalletID) {
                                    walletList[key].Balance = walletCoinDetail.Balance
                                }

                                if (value.CoinName === walletCoinDetail.CoinName && value.AccWalletID === walletCoinDetail.AccWalletID) {
                                    walletList[key].Balance = walletCoinDetail.Balance
                                }
                                //return null
                            });
                            self.setState({ Wallet: walletList, socketBuyData: walletBalance })
                        }
                    }
                }
            } catch (error) {
            }
        });
    }

    componentWillUnmount() {
        this.setState({ isComponentActive: 0 });
    }

    // invoke when component recive props
    componentWillReceiveProps(nextprops) {
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
                            currencyPairID: pairItem.PairId,
                            UpDownBit: pairItem.UpDownBit,
                            takersValue: pairItem.SellFees,
                            makersValue: pairItem.BuyFees,
                            priceLength:pairItem.PriceLength,                            
                            qtyLength:pairItem.QtyLength,
                            amtLength:pairItem.AmtLength
                        });

                    }
                   // return null
                })
             //   return null
            });

        } else {
            this.setState({ showLoader: false });
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
                  //  return null
                });
            }

            this.setState({ Wallet: nextprops.wallet });
        }

        if (nextprops.arbitrageBuyerOrder && nextprops.arbitrageBuyerOrder !== null && this.state.buyOrderBit !== nextprops.arbitrageBuyerOrderBit) {

			var exchangeList = [];
			nextprops.arbitrageBuyerOrder.map((exchange) => {
				exchangeList[exchange.ProviderName.toLowerCase()] = {LTP:0.0};				
			});
			this.displayArbitrage = 1;
			this.exchangeList = exchangeList;
			
			//disconnect from server
            if(Object.keys(this.sockets).length) {
                Object.keys(this.sockets).map((ProviderName) => {
                    this.sockets[ProviderName].disconnect();
				});
				this.sockets = {};
			}
			
			this.setState({
				exchangeList:exchangeList
			});
			this.connectWebSocket();

		} else if (nextprops.arbitrageBuyerOrder && nextprops.arbitrageBuyerOrder.length === 0 && this.state.buyOrderBit !== nextprops.arbitrageBuyerOrderBit) {
			
			//disconnect from server
            if(Object.keys(this.sockets).length) {
                Object.keys(this.sockets).map((ProviderName) => {
                    this.sockets[ProviderName].disconnect();
				});
				this.sockets = {};
			}

			this.displayArbitrage = 0;
			this.exchangeList = [];
			this.setState({
				exchangeList : []
			});
			//this.connectWebSocket(); // need to disconnect socket

		} else if ((nextprops.arbitrageBuyerOrder === null || typeof nextprops.arbitrageBuyerOrder == undefined) && this.state.buyOrderBit !== nextprops.arbitrageBuyerOrderBit) {

			//disconnect from server
            if(Object.keys(this.sockets).length) {
                Object.keys(this.sockets).map((ProviderName) => {
                    this.sockets[ProviderName].disconnect();
				});
				this.sockets = {};
			}

			this.displayArbitrage = 0;
			this.exchangeList = [];
			this.setState({
				buyerOrder: [],
				buyOrderBit: nextprops.arbitrageBuyerOrderBit,
				exchangeList : []
			});
			//this.connectWebSocket(); // need to disconnect socket

        }
        
    }

    updateExchangeListLTP = (exchangeList) => {

        /* const promises = Object.keys(exchangeList).map(async (exchange) => {
            return exchangeList[exchange];
        });
    
        Promise.all(promises).then((allExchanges) => { */
            //console.log(allExchanges);
            this.setState({exchangeList:exchangeList /* allExchanges */});
       /*  }).catch(e => {
            console.log(e);
        }); */
		
	};

	connectWebSocket() {
		var self = this;

		Object.keys(self.exchangeList).map((ProviderName) => {
			
			this.sockets[ProviderName] = socketIOClient(SocketURl+ProviderName,{query:{pair:this.state.currencyPair === 'BTC_USD' ? 'BTC_USDT' : this.state.currencyPair,channelID:AppConfig.tickerChannelID}});
			this.sockets[ProviderName].on(ProviderName+(this.state.currencyPair === 'BTC_USD' ? 'BTC_USDT' : this.state.currencyPair).split('_').join(''), async (data) => {

				if(this.displayArbitrage) {
					self.exchangeList[ProviderName].OldLTP = self.exchangeList[ProviderName].LTP;
					//self.exchangeList[ProviderName].change = data.last - self.exchangeList[ProviderName].LTP;
                    self.exchangeList[ProviderName].LTP = data.last;
                    self.exchangeList[ProviderName].Volume = data.Volume;
					
					self.updateExchangeListLTP(self.exchangeList);
				}
				
			});

		});
		
    }
    
    // set buy orders for multiple or single record
    setBuyOrders = (price, amount, isMultiple, totalData, LpType,record) => {

        var bulkBuyOrder = []
        if (isMultiple === true) {

            bulkBuyOrder = this.state.bulkBuyOrder;
            if (price && price !== 0) {

                if (totalData !== "" && totalData !== undefined && bulkBuyOrder && bulkBuyOrder.length) {

                    bulkBuyOrder = this.state.bulkBuyOrder;
                    var isAvailable = bulkBuyOrder.findIndex(fav => fav.LpType === LpType);
					
                    if (isAvailable !== -1) {
                        let total = parseFloat(parseFloat(price) * parseFloat(amount)).toFixed(8);
                        bulkBuyOrder[isAvailable].rate = price;
                        bulkBuyOrder[isAvailable].quantity = parseFloat(amount);
                        bulkBuyOrder[isAvailable].total = (totalData !== "" && totalData != undefined) ? totalData : total;
                        bulkBuyOrder[isAvailable].LpType = bulkBuyOrder[isAvailable].LpType
                        bulkBuyOrder[isAvailable].MinNotional = record.MinNotional;
                        bulkBuyOrder[isAvailable].MaxNotional = record.MaxNotional;

                        bulkBuyOrder[isAvailable].MinPrice = record.MinPrice;
                        bulkBuyOrder[isAvailable].MaxPrice = record.MaxPrice;
                        bulkBuyOrder[isAvailable].MinQty = record.MinQty;
                        bulkBuyOrder[isAvailable].MaxQty = record.MaxQty;
                    } else {
                        let total = parseFloat(parseFloat(price) * parseFloat(amount)).toFixed(8);
                        bulkBuyOrder.push({
                            "rate": price,
                            "quantity": parseFloat(amount),
                            "total": (totalData !== "" && totalData != undefined) ? totalData : total,
                            "LpType": LpType,
                            "MinNotional":record.MinNotional,
                            "MaxNotional":record.MaxNotional,
                            "MinPrice" : record.MinPrice,
                            "MaxPrice" : record.MaxPrice,
                            "MinQty" : record.MinQty,
                            "MaxQty" : record.MaxQty,
                        })
                        bulkBuyOrder.formType = 1
                        this.setState({formType : 1})
                    }

                    bulkBuyOrder.bulkPercentage = (totalData !== "" && totalData != undefined) ? true : false

                } else {
                    let total = parseFloat(parseFloat(price) * parseFloat(amount)).toFixed(8);
                    bulkBuyOrder.push({
                        "rate": price,
                        "quantity": amount,
                        "total": (totalData !== "" && totalData !== undefined) ? totalData : total,
                        "LpType": LpType,
                        "MinNotional":record.MinNotional,
                        "MaxNotional":record.MaxNotional,
                        "MinPrice" : record.MinPrice,
                        "MaxPrice" : record.MaxPrice,
                        "MinQty" : record.MinQty,
                        "MaxQty" : record.MaxQty,
                    })
                    bulkBuyOrder.formType = 1
                    this.setState({formType : 1})
                    bulkBuyOrder.bulkPercentage = (totalData !== "" && totalData !== undefined) ? true : false
                }

            }
            bulkBuyOrder.formType = 1
            this.setState({formType : 1})
            this.setState({
                isBulkBuyOrder: true,
                bulkBuyOrder: bulkBuyOrder,
                isBulkSellOrder: false,
                isBothOrder:false,
                bulkSellOrder: []
            })
        } else if (isMultiple === false) {
            if (this.state.bulkBuyOrder && this.state.bulkBuyOrder.length) {
                if (price && price !== 0) {

                    this.state.bulkBuyOrder.map((item, index) => {
                        if (item.LpType === LpType) {
                            if(this.state.bulkBuyOrder.length === 1){
                                bulkBuyOrder=[]
                            }
                        } else {
                            item.formType = 1
                            this.setState({formType : 1})
                            bulkBuyOrder.push(item)
                        }
                        //return null
                    })

                    if (bulkBuyOrder && bulkBuyOrder.length) {
                        bulkBuyOrder.formType = 1
                        this.setState({formType : 1})
                        this.setState({
                            isBulkBuyOrder: true,
                            bulkBuyOrder: bulkBuyOrder,
                            isBulkSellOrder: false,
                            bulkSellOrder: [],
                            isBothOrder:false,
                        });
                    } else {

                        this.setState({
                            isBulkBuyOrder: false,
                            bulkBuyOrder: bulkBuyOrder,
                            isBothOrder:true,
                            isBulkSellOrder: false,
                            bulkSellOrder: []
                        });
                    }

                }
            } else {

                this.setState({
                    isBulkBuyOrder: false,
                    bulkBuyOrder: bulkBuyOrder,
                    isBulkSellOrder: false,
                    bulkSellOrder: [],
                    isBothOrder:false,
                });
            }
        }

        if (isMultiple === undefined) {
            if (price && price !== 0) {
               bulkBuyOrder.rate = price;
                bulkBuyOrder.quantity = "";//amount;
                bulkBuyOrder.total = ""//(totalData !== "" && totalData !== undefined) ? totalData : total;
                bulkBuyOrder.formType = 1
                this.setState({formType : 1})
                bulkBuyOrder.LpType = LpType;
                bulkBuyOrder.MinNotional = record.MinNotional;
                bulkBuyOrder.MaxNotional = record.MaxNotional;
                bulkBuyOrder.MinPrice = record.MinPrice;
                bulkBuyOrder.MaxPrice = record.MaxPrice;
                bulkBuyOrder.MinQty = record.MinQty;
                bulkBuyOrder.MaxQty = record.MaxQty;
            }
            this.setState({
                isBulkBuyOrder: false,
                bulkBuyOrder: bulkBuyOrder,
                isBulkSellOrder: false,
                bulkSellOrder: [],
                isBothOrder:false,
            });
        }

    }

    // set Sell orders for multiple or single record
    setSellOrders = (price, amount, isMultiple, totalData, LpType,record) => {

        var bulkSellOrder = []

        if (isMultiple === true) {

            bulkSellOrder = this.state.bulkSellOrder;

            if (price && price !== 0) {

                if (totalData !== "" && totalData !== undefined && bulkSellOrder && bulkSellOrder.length) {

                    bulkSellOrder = this.state.bulkSellOrder;
                    var isAvailable = bulkSellOrder.findIndex(fav => fav.LpType === LpType);

                    if (isAvailable !== -1) {
                        let total = parseFloat(parseFloat(price) * parseFloat(amount)).toFixed(8);
                        bulkSellOrder[isAvailable].rate = price;
                        bulkSellOrder[isAvailable].quantity = parseFloat(amount);
                        bulkSellOrder[isAvailable].total = totalData !== "" ? totalData : total;
                        bulkSellOrder[isAvailable].LpType = bulkSellOrder[isAvailable].LpType;
                        bulkSellOrder[isAvailable].MinNotional = record.MinNotional;
                        bulkSellOrder[isAvailable].MaxNotional = record.MaxNotional;

                        bulkSellOrder[isAvailable].MinPrice = record.MinPrice;
                        bulkSellOrder[isAvailable].MaxPrice = record.MaxPrice;
                        bulkSellOrder[isAvailable].MinQty = record.MinQty;
                        bulkSellOrder[isAvailable].MaxQty = record.MaxQty;
                    } else {
                        let total = parseFloat(parseFloat(price) * parseFloat(amount)).toFixed(8);
                        bulkSellOrder.push({
                            "rate": price,
                            "quantity": parseFloat(amount),
                            "total": (totalData !== "" && totalData != undefined) ? totalData : total,
                            "LpType": LpType,
                            "MinNotional":record.MinNotional,
                            "MaxNotional":record.MaxNotional,
                            "MinPrice" : record.MinPrice,
                            "MaxPrice" : record.MaxPrice,
                            "MinQty" : record.MinQty,
                            "MaxQty" : record.MaxQty,
                        })
                        bulkSellOrder.formType = 2
                        this.setState({formType : 2})
                    }

                    bulkSellOrder.bulkPercentage = (totalData !== "" && totalData != undefined) ? true : false

                } else {
                    let total = parseFloat(parseFloat(price) * parseFloat(amount)).toFixed(8);
                    bulkSellOrder.push({
                        "rate": price,
                        "quantity": parseFloat(amount),
                        "total": total,
                        "LpType": LpType,
                        "MinNotional":record.MinNotional,
                        "MaxNotional":record.MaxNotional,
                        "MinPrice" : record.MinPrice,
                        "MaxPrice" : record.MaxPrice,
                        "MinQty" : record.MinQty,
                        "MaxQty" : record.MaxQty,
                    })
                    this.setState({formType : 2})
                    bulkSellOrder.formType = 2
                    bulkSellOrder.bulkPercentage = (totalData !== "" && totalData !== undefined) ? true : false
                }

            }

            this.setState({
                isBulkSellOrder: true,
                bulkSellOrder: bulkSellOrder,
                isBulkBuyOrder: false,
                bulkBuyOrder: [],
                isBothOrder:false,
            })

        } else if (isMultiple === false) {

            if (this.state.bulkSellOrder && this.state.bulkSellOrder.length) {
                if (price && price !== 0) {

                    this.state.bulkSellOrder.map((item, index) => {

                        if (item.LpType === LpType) {
                            if(this.state.bulkSellOrder.length === 1){
                                bulkSellOrder=[]
                            }
                        } else {
                            item.formType = 2;
                            bulkSellOrder.push(item)     
                            this.setState({formType : 2})                       
                        }
                     //   return null
                    })
                }

                if (bulkSellOrder && bulkSellOrder.length) {
                    bulkSellOrder.formType = 2
                    this.setState({formType : 2})
                    this.setState({
                        isBulkBuyOrder: false,
                        bulkSellOrder: bulkSellOrder,
                        isBulkSellOrder: true,
                        bulkBuyOrder: [],
                        isBothOrder:false,
                        
                    });
                } else {

                    bulkSellOrder.formType = 2
                    this.setState({formType : 2})
                    this.setState({
                        isBulkBuyOrder: false,
                        bulkBuyOrder: [],
                        isBothOrder:true,
                        isBulkSellOrder: false,
                        bulkSellOrder: bulkSellOrder
                    });
                }

            } else {
                bulkSellOrder.formType = 2
                this.setState({formType : 2})
                this.setState({
                    isBulkSellOrder: false,
                    bulkSellOrder: bulkSellOrder,
                    isBulkBuyOrder: false,
                    bulkBuyOrder: [],
                    isBothOrder:false,
                });
            }
        }
        if (isMultiple === undefined) {
            if (price && price !== 0) {
                let total = parseFloat(parseFloat(price) * parseFloat(amount)).toFixed(8);
                   bulkSellOrder.rate = price;
                bulkSellOrder.quantity = amount;
                bulkSellOrder.total = total;
                bulkSellOrder.formType = 2
                this.setState({formType : 2})
                bulkSellOrder.LpType = LpType
                bulkSellOrder.MinNotional = record.MinNotional;
                bulkSellOrder.MaxNotional = record.MaxNotional;
                bulkSellOrder.MinPrice = record.MinPrice;
                bulkSellOrder.MaxPrice = record.MaxPrice;
                bulkSellOrder.MinQty = record.MinQty;
                bulkSellOrder.MaxQty = record.MaxQty;
                
            }
            
            this.setState({
                isBulkSellOrder: false,
                bulkSellOrder: bulkSellOrder,
                isBulkBuyOrder: false,
                bulkBuyOrder: [],
                isBothOrder:false,
            });
        }

    }

    ClearAllFields = () => {

        this.setState({
            bulkBuyOrder:[],
            bulkSellOrder:[],
            isBulkBuyOrder:false,
            isBulkSellOrder:false,
            isBothOrder:false
        })
    }

    // function for change selected currency pair
    changeCurrencyPair = (value) => {

        var pairs = "";
        if (value) {
            const oldPair = this.state.currencyPair;
            const pair = value.PairName;
            const pairId = value.PairId;
            const firstCurrency = value.Abbrevation;
            pairs = value.PairName;
            this.setState({
                firstCurrency: firstCurrency,
                currencyPair: pair,
                currencyPairID: pairId,
                UpDownBit: value.UpDownBit,
                takersValue: value.SellFees,
                makersValue: value.BuyFees,
                langDropdownOpen: !this.state.langDropdownOpen,
                bulkSellOrder: [],
                bulkBuyOrder: [],
                priceLength:value.PriceLength,
                qtyLength:value.QtyLength,
                amtLength:value.AmtLength,
                isBulkSellOrder: false,                
                isBulkBuyOrder: false,                
                isBothOrder:true,
                formType:1

            });
            this.state.hubConnection.invoke("AddArbitragePairSubscription", pair, oldPair)
            .catch((err) => {}
            //console.error("AddArbitragePairSubscription", err)
            );

            const tempSecondCurrency = value.PairName.split("_")[1];
            if (this.state.secondCurrency !== tempSecondCurrency) {

                this.state.hubConnection.invoke("AddArbitrageMarketSubscription", tempSecondCurrency, this.state.secondCurrency)
                .catch((err) =>
                {}
                    //console.error("AddArbitrageMarketSubscription", err)
                );
                this.setState({
                    secondCurrency: tempSecondCurrency,
                });
            }

        } else {

        }

        // call All methods that are use in child components
        this.props.getArbitrageChartData({ Pair: pairs, Interval: '1m' });
        this.props.atbitrageBuyerBook({ Pair: pairs });
        this.props.atbitrageSellerBook({ Pair: pairs });
        this.props.arbitrageMarketTradeHistory({ Pair: pairs });
        this.props.arbitrageGetExchangeList({ Pair: pairs });

    }

    	// code added by devang parekh for handle modal (19-6-2019)
        closeModel() {
            window.location.href = AppConfig.afterLoginRedirect;
        }
    
        agreeModal = () => {
            localStorage.setItem("_SmartTrading",1);
            this.setState({ isShowModal: false });
        }
        // end

    render() {

        const {formType} = this.state;

        var firstCurrencyWalletId = 0;
        var secondCurrencyWalletId = 0;

        if (this.state.Wallet.length !== 0) {
            var secondCurrencyBal = this.state.Wallet.findIndex(wallet => wallet.CoinName === this.state.secondCurrency && wallet.IsDefaultWallet === 1);
            var firstCurrencyBal = this.state.Wallet.findIndex(wallet => wallet.CoinName === this.state.firstCurrency && wallet.IsDefaultWallet === 1);

            if (secondCurrencyBal !== -1) {
                this.state.secondCurrencyBalance = this.state.Wallet[secondCurrencyBal].Balance
                secondCurrencyWalletId = this.state.Wallet[secondCurrencyBal].AccWalletID
            } else {
                this.state.secondCurrencyBalance = 0
                secondCurrencyWalletId = 0
            }

            if (firstCurrencyBal !== -1) {
                this.state.firstCurrencyBalance = this.state.Wallet[firstCurrencyBal].Balance
                firstCurrencyWalletId = this.state.Wallet[firstCurrencyBal].AccWalletID

            } else {
                this.state.firstCurrencyBalance = 0
                firstCurrencyWalletId = 0

            }
        }

        if (this.state.currentMarket) {
            this.state.currentMarket.map(value => {
                if (value.firstCurrency === this.state.firstCurrency) {
                    this.state.currentBuyPrice = value.BuyPrice,
                    this.state.currentSellPrice = value.SellPrice

                }
               // return null
            });
        }

        return (
            <Fragment>
                
                {this.state.isShowModal === false ? // check condition if agreed or not if yes then load dashboard otherwise not. (devang parekh 19-6-2019)
                <div>
                <div className="d-flex arbitrage_area">
                    <div className="col-md-2 col-sm-3 col-xs-12 exchange_area">
                        <PairSelection
                            {...this.props}
                            state={this.state}
                            pairData={this.state.pairList}
                            firstCurrency={this.state.firstCurrency}
                            secondCurrency={this.state.secondCurrency}
                            currencyPair={this.state.currencyPair}
                            displayFavouritePair={this.openFavourite}
                            changePairs={this.changeCurrencyPair}
                            hubConnection={this.state.hubConnection}
                            exchangeListDetail={this.state.exchangeList}
                        />
                        <ExchangeList
                            currencyPair={this.state.currencyPair}                            
                            autoHeightMin={380}
                            autoHeightMax={380}
                            hubConnection={this.state.hubConnection}
                            exchangeListDetail={this.state.exchangeList}
                            priceLength={this.state.priceLength}
                            {...this.props}
                        />
                    </div>
                    <div className="col-md-10 col-sm-9 col-xs-12 buy_sell_area">
                        <div className="row">
                            <div className="col-sm-12 col-md-5 col-lg-5">
                                <h2 className="text-left pl-5">                                    
                                    <IntlMessages id="sidebar.arbitrageOrderBook" />
                                </h2>
                            </div>
                            <div className="col-sm-12 col-md-2 col-lg-2">
                            <div className="row m-0 mb-10 tblst">
                                <div className={`col-6 buy${formType === 1 ? ' active' : ''}`}>
                                    <IntlMessages id="trading.placeorder.label.buy" />
                                </div>
                                <div className={`col-6 sell${formType === 2 ? ' active' : ''}`}>
                                    <IntlMessages id="trading.placeorder.label.sell" />
                                </div>
                            </div>
                            </div>
                            <div className="col-sm-12 col-md-5 col-lg-5">
                                <span className="text-right pr-5">
                                <IntlMessages id="trading.holdingorder.label.balance" />
                                {": "}
                                    {this.state.secondCurrencyBalance.toFixed(this.state.priceLength)} {" "} {this.state.secondCurrency} -- {this.state.firstCurrencyBalance.toFixed(this.state.qtyLength)} {" "} {this.state.firstCurrency}
                                </span>
                            </div>                            

                        </div>
                        <BuySellTrade
                            {...this.props}
                            firstCurrency={this.state.firstCurrency}
                            secondCurrency={this.state.secondCurrency}
                            currencyPair={this.state.currencyPair}
                            firstCurrencyBalance={this.state.firstCurrencyBalance}
                            secondCurrencyBalance={this.state.secondCurrencyBalance}
                            autoHeightMin={160}
                            autoHeightMax={160}
                            UpDownBit={this.state.UpDownBit}
                            hubConnection={this.state.hubConnection}
                            currencyPairID={this.state.currencyPairID}
                            state={this.state}
                            buyPrice={this.state.currentBuyPrice}
                            sellPrice={this.state.currentSellPrice}
                            bulkBuyOrder={this.state.bulkBuyOrder}
                            bulkSellOrder={this.state.bulkSellOrder}
                            isBulkBuyOrder={this.state.isBulkBuyOrder}
                            isBulkSellOrder={this.state.isBulkSellOrder}
                            firstCurrencyWalletId={firstCurrencyWalletId}
                            secondCurrencyWalletId={secondCurrencyWalletId}
                            takers={this.state.takersValue}
                            makers={this.state.makersValue}
                            sellFees={this.state.takersValue}
                            buyFees={this.state.makersValue}

                            setBuyOrders={this.setBuyOrders}
                            setSellOrders={this.setSellOrders}
                            isBothOrder={this.state.isBothOrder}
                            ClearAllFields={this.ClearAllFields}
                            exchangeList={this.state.exchangeList}
                            priceLength={this.state.priceLength}
                            qtyLength={this.state.qtyLength}
                            amtLength={this.state.amtLength}
                        />
                    </div>
                </div>
                  {/* <div className="col-12 mt-25 arbitrage"> */}
                  <div className="mt-25 arbitrage arbitrage_reports">
                    <OrderTabList
                        currencyPair={this.state.currencyPair}
                        defaultTab="open_order" {...this.props}
                        hubConnection={this.state.hubConnection}
                        Wallet={this.state.Wallet}
                    />
                </div>
                </div>
                 :	/* Code added by devang parekh for display modal when load dashbaord */
                 <Modal isOpen={this.state.isShowModal} className="mdl_announcement modal-dialog-centered big_mdl_80">
                     <ModalHeader>
                         <IntlMessages id="widgets.note" />
                     </ModalHeader>
                     <ModalBody>
                         <IntlMessages id="sidebar.noteMessageForSmarttrading" />
                     </ModalBody>
                     <ModalFooter>
                         <Button
                             //color="primary"
                             className={"btn-comman mr-10 border-0 rounded-0"}
                             onClick={this.agreeModal}><IntlMessages id="wallet.btnAgree" /></Button>{' '}
                         <Button
                             color="danger"
                             className="mr-10 border-0 rounded-0"
                             onClick={this.closeModel}><IntlMessages id="sidebar.btnDisagree" /></Button>
                     </ModalFooter>
                 </Modal>
             }
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    wallet: state.ArbitrageWalletReducer.walletList,
    pairList: state.arbitrageOrderBook.arbitragePairList,
    arbitrageBuyerOrder: state.arbitrageOrderBook.arbitrageBuyerOrder,
    arbitrageBuyerOrderBit: state.arbitrageOrderBook.arbitrageBuyerOrderBit,
});

export default connect(mapStateToProps, {
    getArbitragePairList,
    getArbitrageChartData,
    atbitrageBuyerBook,
    atbitrageSellerBook,    
    getCurrencyList,    
    getArbitrageWalletList,
    arbitrageMarketTradeHistory,
    arbitrageGetExchangeList,
})(Dashboard);