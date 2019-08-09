// component for Arbitrage trading Dashboard  by Tejas 11/6/2019

import React, { Fragment } from 'react';
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
    listExchangeSmartArbitrage, //added by salim dt:12/06/2019
    arbitrageTradeOrder
} from "Actions/Arbitrage";
// used for display notifications
import { NotificationManager } from "react-notifications";
// import for display Loader
import JbsLoader from "Components/JbsPageLoader/JbsLoader";
import JbsCollapsibleCard from 'Components/JbsCollapsibleCard/JbsCollapsibleCard';
import $ from 'jquery';
import OrderTabList from "./../OrderTabList";
import Slider from 'react-rangeslider';
import GridView from './gridView';
import TableView from './tableView';

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
            hubConnection: this.props.location.state.hubConnection,
            WalletSignalRData: [],
            listExSmartArbitrageSignalRData: [],
            QtyLength: 0,
            PriceLength: 0,
            AmtLength: 0,
            Fees: 0,
            tableView: false
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
        //Added by salim dt:12/06/2019
        this.props.listExchangeSmartArbitrage({ Pair: this.state.currencyPair });
        var self = this;

        self.state.hubConnection.on('RecieveWalletBalArbitrage', (walletBalance) => {
            try {
                walletBalance = JSON.parse(walletBalance);
                if (self.isComponentActive === 1 && typeof walletBalance.Data !== 'undefined' && walletBalance.Data !== '') {
                    if ((walletBalance.EventTime && self.state.WalletSignalRData.length === 0) || (self.state.WalletSignalRData.length !== 0 && walletBalance.EventTime >= self.state.WalletSignalRData.EventTime)) {
                        const walletCoinDetail = walletBalance.Data;
                        if (walletCoinDetail.CoinName !== '') {
                            var walletList = $.extend(true, [], self.state.Wallet);
                            walletList.map((value, key) => {
                                if (value.CoinName === walletCoinDetail.CoinName && value.AccWalletID === walletCoinDetail.AccWalletID) {
                                    walletList[key].Balance = walletCoinDetail.Balance;
                                }

                                if (value.CoinName === walletCoinDetail.CoinName && value.AccWalletID === walletCoinDetail.AccWalletID) {
                                    walletList[key].Balance = walletCoinDetail.Balance;
                                }
                            });
                            self.setState({ Wallet: walletList, WalletSignalRData: walletBalance });
                        }
                    }
                }
            } catch (error) { }
        });

        // code added by devang parekh (18-6-2019) for handle signalr response to handle arbitrage trading detail list with all
        self.state.hubConnection.on('RecieveExchangeListSmartArbitrage', (receivedMessage) => {
            //console.log(" RecieveExchangeListSmartArbitrage",receivedMessage);
            if (self.isComponentActive === 1 && receivedMessage !== null) {
                try {
                    const receivedMessageData = JSON.parse(receivedMessage);
                    if ((receivedMessageData.EventTime && this.state.listExSmartArbitrageSignalRData.length == 0) || (this.state.listExSmartArbitrageSignalRData.length !== 0 && receivedMessageData.EventTime >= this.state.listExSmartArbitrageSignalRData.EventTime)) {
                        if (this.state.currencyPair === receivedMessageData.Parameter) {
                            this.setState({ listExSmartArbitrage: receivedMessageData.Data, listExSmartArbitrageSignalRData: receivedMessageData });
                        }
                    }
                } catch (error) { }
            }
        });
        //end
    }

    componentWillUnmount() {
        // on unmount set default pair for arbitrage trading (18-6-2019) devang parekh
        this.state.hubConnection.invoke("AddArbitragePairSubscription", AppConfig.defaultArbitragePair, this.state.currencyPair)
            .catch((err) => { }
            );
        // end
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
                    secondCurrencyBalance = this.state.Wallet[secondCurrencyBal].Balance;
                    secondCurrencyWalletId = this.state.Wallet[secondCurrencyBal].AccWalletID;
                } else {
                    secondCurrencyBalance = 0;
                    secondCurrencyWalletId = 0;
                }

                if (firstCurrencyBal !== -1) {
                    firstCurrencyBalance = this.state.Wallet[firstCurrencyBal].Balance;
                    firstCurrencyWalletId = this.state.Wallet[firstCurrencyBal].AccWalletID;
                } else {
                    firstCurrencyBalance = 0;
                    firstCurrencyWalletId = 0;
                }
                //Added by salim dt:12/06/2019
                //   this.props.listExchangeSmartArbitrage({ Pair: pair });
            }

            // added byd evnag parekh (18-6-2019) for change pair in signalr for getting real time update based on pair change
            this.state.hubConnection.invoke("AddArbitragePairSubscription", pair, oldPair)
                .catch((err) => { }
                );
            // end

            //Added by salim dt:12/06/2019
            this.props.listExchangeSmartArbitrage({ Pair: pair });
            this.setState({
                firstCurrency: firstCurrency,
                currencyPair: pair,
                currencyPairID: pairId,
                secondCurrency: tempSecondCurrency,
                firstCurrencyWalletId: firstCurrencyWalletId,
                secondCurrencyWalletId: secondCurrencyWalletId,
                secondCurrencyBalance: secondCurrencyBalance,
                firstCurrencyBalance: firstCurrencyBalance,
                QtyLength: value.QtyLength,
                PriceLength: value.PriceLength,
                AmtLength: value.AmtLength,
                Fees: parseFloat(value.BuyFees + value.SellFees).toFixed(2)
            });
        }
    }

    // invoke when component recive props
    componentWillReceiveProps(nextprops) {
        //Added by salim dt:12/06/2019
        if (nextprops.listExSmtArbitrage.hasOwnProperty('response') && nextprops.listExSmtArbitrage.response !== null && nextprops.listExSmtArbitrage.response.length > 0) {
            this.setState({ listExSmartArbitrage: nextprops.listExSmtArbitrage.response });
        } else if (nextprops.listExSmtArbitrage.hasOwnProperty('response') && (nextprops.listExSmtArbitrage.response === null || nextprops.listExSmtArbitrage.response.length === 0)) {
            this.setState({ listExSmartArbitrage: [] });
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
                            currencyPairID: pairItem.PairId,
                            QtyLength: pairItem.QtyLength,
                            PriceLength: pairItem.PriceLength,
                            AmtLength: pairItem.AmtLength,
                            Fees: parseFloat(pairItem.BuyFees + pairItem.SellFees).toFixed(2)
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

        if (this.state.arbitrageTradeOrderBit !== nextprops.arbitrageTradeOrderBit && nextprops.arbitrageTradeOrderData) {
            if (nextprops.arbitrageTradeOrderData.statusCode == 200 && nextprops.arbitrageTradeOrderData.ErrorCode == 4566) {
                NotificationManager.success(<IntlMessages id={"trading.orders.orders.trnid"} values={nextprops.arbitrageTradeOrderData.response} />);
            } else if (nextprops.arbitrageTradeOrderData.statusCode == 200 && nextprops.arbitrageTradeOrderData.ErrorCode == 4568) {
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
        var MultipleOrderList = [];

        if (record && record.ProviderBuy) {
            if ((this.state.currencyPairID == '' || this.state.currencyPairID == undefined || this.state.currencyPairID == 0)) {
                NotificationManager.error(<IntlMessages id="error.trading.transaction.4601" />);
            } else if ((this.state.secondCurrencyWalletId == '' || this.state.secondCurrencyWalletId == undefined || this.state.secondCurrencyWalletId == 0)) {
                NotificationManager.error(<IntlMessages id="error.trading.creditwallet" />);
            } else if ((this.state.firstCurrencyWalletId == '' || this.state.firstCurrencyWalletId == undefined || this.state.firstCurrencyWalletId == 0)) {
                NotificationManager.error(<IntlMessages id="error.trading.debitwallet" />);
            } else {
                const data = {
                    currencyPairID: this.state.currencyPairID,
                    debitWalletID: this.state.secondCurrencyWalletId,
                    creditWalletID: this.state.firstCurrencyWalletId,
                    feePer: 0,
                    fee: 0,
                    trnMode: 11,
                    price: parseFloat(record.ProviderBuy.LTP).toFixed(this.state.PriceLength),
                    amount: parseFloat(firstBal).toFixed(this.state.QtyLength),
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
                MultipleOrderList.push(data);
            }
        }

        if (record && record.ProviderSELL) {
            if (this.state.currencyPairID == '' || this.state.currencyPairID == undefined || this.state.currencyPairID == 0) {
                NotificationManager.error(<IntlMessages id="error.trading.transaction.4601" />);
            } else if (this.state.secondCurrencyWalletId == '' || this.state.secondCurrencyWalletId == undefined || this.state.secondCurrencyWalletId == 0) {
                NotificationManager.error(<IntlMessages id="error.trading.creditwallet" />);
            } else if (this.state.firstCurrencyWalletId == '' || this.state.firstCurrencyWalletId == undefined || this.state.firstCurrencyWalletId == 0) {
                NotificationManager.error(<IntlMessages id="error.trading.debitwallet" />);
            } else {
                const data = {
                    currencyPairID: this.state.currencyPairID,
                    debitWalletID: this.state.firstCurrencyWalletId,
                    creditWalletID: this.state.secondCurrencyWalletId,
                    feePer: 0,
                    fee: 0,
                    trnMode: 11,
                    price: parseFloat(record.ProviderSELL.LTP).toFixed(this.state.PriceLength),
                    amount: parseFloat(firstBal).toFixed(this.state.QtyLength),
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
                MultipleOrderList.push(data);
            }
        }

        if (MultipleOrderList.length) {
            const payload = {
                MultipleOrderList: MultipleOrderList,
                Pair: this.state.firstCurrency + '_' + this.state.secondCurrency
            }

            this.setState({ placeOrderBit: 1 });
            this.props.arbitrageTradeOrder(payload);
        }
    }

    changeProfitPer = (value) => {
        if (this.state.selectedPer !== value) {
            this.setState({ selectedPer: value });
        }
    }

    handleOnChangeSlider = (value) => {
        if (this.state.selectedPer !== value) {
            this.setState({
                selectedPer: value
            })
        }
      }

    onChangeView(value) {
        this.setState({ tableView: value })
    }

    //renders the component
    render() {
        const { listExSmartArbitrage } = this.state;
        const pairListData = [];
        this.state.pairList && this.state.pairList.map((item, key) => {
            item.PairList && item.PairList.map((pair, index) => {
                pairListData.push(pair)
            });
        });

        //returns the compontn
        return (
            <Fragment>
                <div className="card todo-wrapper overflow-hidden">
                    <div className="col-md-12">
                        <div className="mt-2 text-right arbi_btn_area">
                            <span><i className={this.state.tableView ? "zmdi zmdi-view-headline zmdi-hc-2x mr-10 btn_active" : "zmdi zmdi-view-headline zmdi-hc-2x mr-10"} onClick={() => this.onChangeView(true)} /><i className={!this.state.tableView ? "zmdi zmdi-grid zmdi-hc-2x btn_active" : "zmdi zmdi-grid zmdi-hc-2x"} onClick={() => this.onChangeView(false)} /></span>
                        </div>
                        {(this.props.pairListDataLoading || this.props.loading || this.props.loader) && <JbsLoader />}
                        <div className="arbitrage-trading mb-10 px-30 pt-10">
                            <div className="row">
                                <div className="col-md-2 mt-20">
                                    <h2 className="ml-5"><IntlMessages id="sidebar.arbitrageTrading" /></h2>
                                </div>
                                <div className="col-md-3 mt-15">
                                    <Select className="r_sel_20 mb-5"
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
                                <div className="col-md-4 calulcate-trading mt-5">
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
                                        labels={{ 5: '5', 25: "25", 45: "45", 65: "65", 85: '85' }}
                                        //handleLabel={String}
                                    />
                                    {/* <span>
                                        <Button value="5" className={classnames( { activeBtn: this.state.selectedPer === 5 }, "btn-per m-2 btn btn-primary")} onClick={event => {this.changeProfitPer(5);}}>5%</Button>
                                        <Button value="15" className={classnames({ activeBtn: this.state.selectedPer === 15 },"btn-per m-2 btn btn-primary")} onClick={event => { this.changeProfitPer(15);}}>15%</Button>
                                        <Button value="25" className={classnames({ activeBtn: this.state.selectedPer === 25 },"btn-per m-2 btn btn-primary")} onClick={event => {this.changeProfitPer(25);}}>25%</Button>
                                        <Button value="50" className={classnames({ activeBtn: this.state.selectedPer === 50 },"btn-per m-2 btn btn-primary")} onClick={event => {this.changeProfitPer(50);}}>50%</Button>
                                        <Button value="70" className={classnames({ activeBtn: this.state.selectedPer === 70 },"btn-per m-2 btn btn-primary")} onClick={event => {this.changeProfitPer(70);}}>70%</Button>
                                        <Button value="90" className={classnames({ activeBtn: this.state.selectedPer === 90 },"btn-per m-2 btn btn-primary")} onClick={event => {this.changeProfitPer(90);}}>90%</Button>
                                    </span> */}
                                </div>
                                <div className="col-md-3 mt-20">
                                    {/* <IntlMessages id="wallet.AGAvailableBalance" /> */}
                                    <span className="text-right">
                                        {this.state.firstCurrencyBalance.toFixed(this.state.AmtLength) + " " + this.state.firstCurrency}  <i className="zmdi zmdi-balance-wallet ml-10" /><br />
                                        {this.state.secondCurrencyBalance.toFixed(this.state.PriceLength) + " " + this.state.secondCurrency}  <i className="zmdi zmdi-balance-wallet ml-10" />
                                    </span>
                                </div>
                            </div>
                            <div className="trading-table mt-15">
                            {listExSmartArbitrage && listExSmartArbitrage.length
                                ? <Fragment>
                                    {this.state.tableView
                                        ? <TableView TradeOrder={this.TradeOrder} data={listExSmartArbitrage} {...this.state} />
                                        : <GridView TradeOrder={this.TradeOrder} data={listExSmartArbitrage} {...this.state} />
                                    }
                                </Fragment>
                                : <td className="col-12 text-center mt-15"><IntlMessages id="trading.activeorders.label.nodata" /></td>
                            }
                            </div>
                        </div>
                    </div>

                    <div className="mt-25 arbitrage">
                    <OrderTabList
                        currencyPair={this.state.currencyPair}
                        defaultTab="open_order" {...this.props}
                        hubConnection={this.state.hubConnection}
                        Wallet={this.state.Wallet}
                        displayLoader={false}
                    />
                </div>
                </div>
               
            </Fragment>
        )
    }
}


const mapStateToProps = state => ({
    //pairList: state.tradePairList.pairList,
    wallet: state.ArbitrageWalletReducer.walletList,
    loading: state.ArbitrageWalletReducer.loading || state.ArbitrageTrading.loading ? true : false,
    pairList: state.arbitrageOrderBook.arbitragePairList,
    pairListDataLoading: state.arbitrageOrderBook.pairListDataLoading,
    listExSmtArbitrage: state.ArbitrageTrading.listExSmtArbitrage,
    loader: state.ArbitrageTrading.arbiTrageTradeOrderLoader,
    arbitrageTradeOrderData: state.ArbitrageTrading.arbitrageTradeOrderData,
    arbitrageTradeOrderError: state.ArbitrageTrading.arbitrageTradeOrderError,
    arbitrageTradeOrderBit: state.ArbitrageTrading.arbitrageTradeOrderBit,
});

export default connect(mapStateToProps, {
    getArbitragePairList,
    listExchangeSmartArbitrage,
    getArbitrageWalletList,
    arbitrageTradeOrder
})(ArbitrageTradingDashboard);