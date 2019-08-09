/**
 * Author : Salim Deraiya
 * Created : 27/05/2019
 *  Arbitrage Open Order
 * Update: Devang Parekh
 * Update Detail : Get active order call in this and bind signalr into this
*/

import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { NotificationManager } from "react-notifications";
import IntlMessages from "Util/IntlMessages";
import JbsSectionLoader from "Components/JbsPageLoader/JbsLoader";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import { Button } from 'reactstrap';
import OpenOrder from './OpenOrder';
import TradeHistory from './TradeHistory';

import { arbitrageOpenOrder } from 'Actions/Arbitrage';

class OrderTabList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayOtherPairs: false,
            cancelAll: 0,
            cancelAllValue: "",
            activeMyOpenOrder: [],
            showLoader: false,
            activeOrderBitCount: 0,
            activeOpenOrder: [],
            recentOrderBit: 0,
            socketData: [],
            recentOrderSocketData: [],
            data: {
                Pair: "",
                OrderType: "",
                FromDate: "",
                ToDate: "",
                Page: 0,
                IsMargin: 0,
            },
        };
    }

    // active order process for handling signalr response
    processForActiveOrder() {

        // Call When Get Data From Socket/SignalR      
        this.props.hubConnection.on('RecieveActiveOrderArbitrage', (openOrderDetail) => {

            //console.log("call from SignalR RecieveActiveOrderArbitrage",openOrderDetail);
            if (this.isComponentActive === 1 && openOrderDetail !== null) {

                //var openorders = this.state.openOrderList;  
                try {

                    const openOrderDetailData = JSON.parse(openOrderDetail);

                    if ((openOrderDetailData.EventTime && this.state.socketData.length === 0) ||
                        (this.state.socketData.length !== 0 && openOrderDetailData.EventTime >= this.state.socketData.EventTime)) {

                        const newData = openOrderDetailData.Data
                        if (parseFloat(newData.Price) >= 0) {

                            var openorders = $.extend(true, [], this.state.openOrderList);
                            //console.log("findIndexOrderId start ",(new Date()))
                            var findIndexOrderId = openorders.findIndex(openorders => parseFloat(openorders.Id) === parseFloat(newData.Id));
                            //console.log("findIndexOrderId end ",findIndexOrderId,(new Date()))
                            if (findIndexOrderId === -1) {

                                if (parseFloat(newData.Amount) > 0) {
                                    openorders.unshift(newData);
                                }

                            } else {

                                if (parseFloat(newData.Amount) > 0) {
                                    openorders[findIndexOrderId] = newData
                                } else {
                                    openorders.splice(findIndexOrderId, 1)
                                }

                            }

                            this.setState({ openOrderList: openorders, socketData: openOrderDetailData });

                        }

                    }

                } catch (error) {
                    //console.log("errorRecieveActiveOrder ",error)
                }

            }

        });

        if (this.props.isLogin === undefined) {
            this.props.arbitrageOpenOrder(this.state.data);
        }

    }

    processForMyTradeHistory() {

    }

    processForMyBalaces() {

    }

    // recent order process for handling signalr response
    processForTradeHistory() {


    }
    //end


    componentWillMount() {

        this.isComponentActive = 1;
        this.processForActiveOrder(); //process for handling signalr response
        this.processForRecentOrder(); //process for handling signalr response
        this.processForMyTradeHistory(); //process for handling signalr response
        this.processForMyBalaces(); //process for handling signalr response

        this.props.hubConnection.on('RecieveRecentOrderArbitrage', (recentOrderDetail) => {
            console.log("Get Data from signalR RecieveRecentOrderArbitrage", recentOrderDetail);

        });

        this.props.hubConnection.on("RecieveTradeHistoryArbitrage", (tradeHistoryDetail) => {
            console.log("Get Data from signalR RecieveTradeHistoryArbitrage", tradeHistoryDetail);

        });

        this.props.hubConnection.on("RecieveOrderHistoryArbitrage", (orderHistoryDetail) => {
            console.log("Get Data from signalR RecieveOrderHistoryArbitrage", orderHistoryDetail);

        });

    }

    componentWillReceiveProps(nextProps) {

        console.log("nextProps",nextProps);
        // open order process
        if (nextProps.openOrderList) {
            // set Active My Open Order list if gets from API only
            this.setState({
                OpenOrderList: nextProps.openOrderList,
            });
        }

    }

    render() {
        const { defaultTab } = this.props;
        return (
            <Tabs defaultTab={defaultTab} className="arbitrage_tabs">
                <TabList className="tab_list clearfix">
                    <Tab tabFor="open_order">Open Order (5)</Tab>
                    <Tab tabFor="balance">Balance</Tab>
                    <Tab tabFor="position">Position</Tab>
                    <Tab tabFor="trade_history">Trade History</Tab>
                    <Tab tabFor="pricing_alerts">Pricing Alerts</Tab>
                    <Tab tabFor="logs">Logs</Tab>
                </TabList>
                <div className="tab_cnt_area">
                    <TabPanel tabId="open_order">
                        <OpenOrder isShowTitle={false} {...this.props} />
                    </TabPanel>
                    <TabPanel tabId="balance">
                        Balance
                    </TabPanel>
                    <TabPanel tabId="position">
                        Position
                    </TabPanel>
                    <TabPanel tabId="trade_history">
                        <TradeHistory isShowTitle={false} {...this.props} />
                    </TabPanel>
                    <TabPanel tabId="pricing_alerts">
                        Pricing Alerts
                    </TabPanel>
                    <TabPanel tabId="logs">
                        Logs
                    </TabPanel>
                </div>
            </Tabs>
        );
    }
}

OrderTabList.defaultProps = {
    defaultTab: 'open_order'
}

const mapStateToProps = ({ arbitrageReports }) => {

    const { loading, openOrderList, cancelOrder } = arbitrageReports;

    return { loading, openOrderList, cancelOrder };
}

export default connect(mapStateToProps, {
    arbitrageOpenOrder
})(OpenOrder);

//export default OrderTabList;