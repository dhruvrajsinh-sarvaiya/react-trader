// component for Arbitrage trading Dashboard  by Tejas 11/6/2019

import React from 'react';

//import comopnent for design
import { Button, Table } from 'reactstrap';

// used for convert messages in different langauages
import IntlMessages from "Util/IntlMessages";

// handle Conditional classes (multiple classes)
import classnames from 'classnames';

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
import $ from 'jquery';

import Slider from 'react-rangeslider'
import socketIOClient from "socket.io-client";

const SocketURl = AppConfig.socketUrl;

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
            listExSmartArbitrage: [], //Added by salim dt:12/06/2019
            Wallet: [],
            selectedPer: 5,
            placeOrderBit: 0,
            arbitrageTradeOrderBit: 0,
            WalletSignalRData: [],
            volume: 0,
            exchangeList:[]
        }

        this.exchangeList = {};
        this.listSmartArbitrage = [];
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

                //Added by salim dt:12/06/2019
                //   this.props.listExchangeSmartArbitrage({ Pair: pair });
            }

            //Added by salim dt:12/06/2019
            //this.props.listExchangeSmartArbitrage({ Pair: pair });

            this.setState({
                firstCurrency: firstCurrency,
                currencyPair: pair,
                currencyPairID: pairId,
                secondCurrency: tempSecondCurrency,
                firstCurrencyWalletId: firstCurrencyWalletId,
                secondCurrencyWalletId: secondCurrencyWalletId,
                secondCurrencyBalance: secondCurrencyBalance,
                firstCurrencyBalance: firstCurrencyBalance
            });


        }

    }

    // invoke when component recive props
    componentWillReceiveProps(nextprops) {
        //Added by salim dt:12/06/2019
        
        if (nextprops.arbitrageExchange && nextprops.arbitrageExchange.length) {

            var exchangeList = [];
			nextprops.arbitrageExchange.map((exchange) => {
                exchangeList[exchange.ProviderName.toLowerCase()] = {LTP:0.0};				
			});
            this.exchangeList = exchangeList;
            
            this.setState({
                exchangeList: nextprops.arbitrageExchange
            })

            this.connectWebSocket();

        } else {

            this.setState({
                exchangeList: []
            })

            this.exchangeList = [];

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
                        nonce: "55445454",
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
                        nonce: "55445454",
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

    connectWebSocket() {
		var self = this;
		var sockets = [];
		
		Object.keys(self.exchangeList).map((ProviderName) => {
			
			sockets[ProviderName] = socketIOClient(SocketURl+ProviderName,{query:{pair:this.state.currencyPair}});
			sockets[ProviderName].on(ProviderName+this.state.currencyPair.split('_').join(''), async (data) => {
				self.exchangeList[ProviderName].OldLTP = self.exchangeList[ProviderName].LTP;
				self.exchangeList[ProviderName].LTP = data.last;
                //self.updateExchangeListLTP(self.exchangeList);
                //this.cryptoExchangeArbitrage();
                this.reduceExchCompares(self.exchangeList);
			});

		});
		
    }

    reduceExchCompares(exchangeList) {

        this.listSmartArbitrage = [];
   
        this.state.exchangeList.map((mainExchange,MainIndex) => {

            this.state.exchangeList.map((subExchange,subIndex) => {
                
                var firstExchangeName = mainExchange.ProviderName;
                var secondExchangeName = subExchange.ProviderName;
                
                if(firstExchangeName !== secondExchangeName) {
                    
                    var firstExchangeLTP = exchangeList[firstExchangeName.toLowerCase()].LTP;
                    var secondExchangeLTP = exchangeList[secondExchangeName.toLowerCase()].LTP;
                    var profitPer = ((secondExchangeLTP*100) / firstExchangeLTP) - 100;
                    
                    if(profitPer > 0) {

                        var smartExchange = {};
                        smartExchange.Pair = this.state.currencyPair;
                        smartExchange.NetProfitPer = profitPer;
                        smartExchange.ProviderBuy = {
                                                LPType : mainExchange.LPType,
                                                LTP:firstExchangeLTP,
                                                ProviderName:firstExchangeName
                                            };
                        smartExchange.ProviderSELL = {
                                                LPType : subExchange.LPType,
                                                LTP:secondExchangeLTP,
                                                ProviderName:secondExchangeName
                                            };

                        this.listSmartArbitrage.push(smartExchange);
                    }

                }

            });

        });

    }

    //renders the component
    render() {
        
        let { volume } = this.state

        const { listExSmartArbitrage } = this.state;
        const pairListData = [];

        this.state.pairList && this.state.pairList.map((item, key) => {
            item.PairList && item.PairList.map((pair, index) => {
                pairListData.push(pair)
            });
        });

        //this.state.secondCurrencyBalance = 0
        //returns the compontn
        return (
            <JbsCollapsibleCard
                colClasses="todo-wrapper"
                fullBlock
                customClasses="overflow-hidden"
            >
                <div className="container arbitrage-trading mt-30 mb-30">
                    {(this.props.pairListDataLoading || this.props.loading || this.props.loader) && <JbsLoader />}
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
                        {this.listSmartArbitrage && this.listSmartArbitrage.length
                            ?
                            this.listSmartArbitrage.map((item, key) => {

                                var secondBal = parseFloat(parseFloat(this.state.secondCurrencyBalance * this.state.selectedPer) / 100).toFixed(8)
                                if (this.state.secondCurrencyBalance === 0) {
                                    var firstBal = this.state.firstCurrencyBalance;
                                    secondBal = 0;
                                } else {
                                    var firstBal = secondBal / item.ProviderBuy.LTP;
                                }


                                return <div key={key} className="card d-flex m-5 p-10 mb-10">
                                    <div className="row">

                                    <div className="col-md-2 text-center pt-20">                                            
                                            <span>
                                                {item.NetProfitPer && item.NetProfitPer.toFixed(2)} % {" "}
                                                {item.Pair.split("_")[1]}
                                            </span>
                                        </div>

                                        <div className="col-md-3 text-center" style={{ display: "grid" }}>
                                            <div className="font-weight-bold">
                                              {/*   <img
                                                        src={require('Assets/img/MyAccount/'+ item.ProviderBuy.ProviderName + '.png')}
                                                        className="mr-5 mb-1"
                                                        height="25px"
                                                        width="25px"
                                                        alt={item.ProviderBuy.ProviderName}                                               
                                                    /> */}
                                                {item.ProviderBuy.ProviderName}
                                            </div>    
                                            <div className="font-weight-bold text-success">                                             
                                                {item.ProviderBuy && item.ProviderBuy.LTP.toFixed(8)}
                                            </div>   
                                        </div>

                                        <div className="col-md-3 text-center" style={{ display: "grid" }}>
                                              <div className="font-weight-bold ">
                                                {/* <img
                                                        src={require('Assets/img/MyAccount/'+ item.ProviderSELL.ProviderName + '.png')}
                                                        className="mr-5 mb-1"
                                                        height="25px"
                                                        width="25px"
                                                        alt={item.ProviderSELL.ProviderName}                                               
                                                    /> */}
                                                {item.ProviderSELL.ProviderName}
                                            </div>  
                                            <div className="font-weight-bold text-danger" >                                             
                                                {item.ProviderSELL && item.ProviderSELL.LTP.toFixed(8)}
                                            </div>  
                                        </div>

                                      {/*   <div className="col-md-3 " style={{ display: "grid" }}>

                                            <div className="font-weight-bold text-success">                                             
                                                {item.ProviderBuy && item.ProviderBuy.LTP.toFixed(8)}
                                            </div>   

                                            <div className="font-weight-bold text-danger " >                                             
                                                {item.ProviderSELL && item.ProviderSELL.LTP.toFixed(8)}
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
                                            <Button
                                                //color="primary"
                                                varient="raised"
                                                className="border-0 rounded-0 perverbtn txt"
                                                onClick={(event) => { this.TradeOrder(event, item, firstBal) }}
                                            >
                                                <IntlMessages id="button.trade" />
                                            </Button>
                                            </div>
                                        </div>
                                }

                                        {(firstBal > this.state.firstCurrencyBalance || secondBal > this.state.secondCurrencyBalance || this.state.firstCurrencyBalance === 0 || this.state.secondCurrencyBalance === 0) &&
                                            <div className="col-md-4 text-danger text-center pt-20">
                                                   { ((!firstBal || firstBal > this.state.firstCurrencyBalance) &&
                                                        (!secondBal || secondBal > this.state.secondCurrencyBalance)) ?

                                                        <IntlMessages id={`sidebar.arbiTragePleaseAddBoth`}
                                                            values={{
                                                                Param1: item.Pair.split("_")[0],
                                                                Param2: item.Pair.split("_")[1]
                                                            }} />
                                                        : (!firstBal || firstBal > this.state.firstCurrencyBalance) ?

                                                            <IntlMessages id={`sidebar.arbiTragePleaseAdd`} values={{ Param1: item.Pair.split("_")[0] }} />
                                                            : (!secondBal || secondBal > this.state.secondCurrencyBalance) ?

                                                                <IntlMessages id={`sidebar.arbiTragePleaseAdd`} values={{ Param1: item.Pair.split("_")[1] }} />
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
});

export default connect(mapStateToProps, {
    getArbitragePairList,
    arbitrageGetExchangeList,
    getArbitrageWalletList,
    arbitrageTradeOrder
})(ArbitrageTradingDashboard);