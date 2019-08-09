import React, { Component, Fragment } from 'react';
import { Button, Table } from 'reactstrap';
import IntlMessages from "Util/IntlMessages";
// import scrollbar
import { Scrollbars } from "react-custom-scrollbars";

export default class TableView extends Component {
    render() {
        const listExSmartArbitrage = this.props.data;
        return (
            <Fragment>
                <Table className="striped mb-0 exchange_smart_trade">
                    <colgroup>
                        {/* <col width="15%" />
                        <col width="10%" /> */}
                        <col width="15%" />
                        <col width="20%" />
                        <col width="10%" />
                        <col width="20%" />
                        <col width="10%" />
                        <col width="25%" />
                    </colgroup>
                    <thead>
                        <tr>
                            {/* <th><IntlMessages id="sidebar.colGrossProfit" /></th>
                            <th><IntlMessages id="sidebar.fees" />(%)</th> */}
                            <th><IntlMessages id="sidebar.colProfit" /></th>
                            <th><IntlMessages id="sidebar.arbitrageBuyMarket" /></th>
                            <th><IntlMessages id="trading.currencypair.label.pair" /></th>
                            <th><IntlMessages id="sidebar.arbitrageSellMarket" /></th>
                            <th><IntlMessages id="widgets.status" /></th>
                            <th><IntlMessages id="sidebar.arbitrageUsedFund" /></th>
                        </tr>
                    </thead>
                </Table>
                <Scrollbars className="jbs-scroll" autoHeight autoHeightMin={300} autoHeightMax={300} autoHide>
                    <Table className="table m-0 p-0 buy-table">
                        <colgroup>
                            {/* <col width="15%" />
                            <col width="10%" /> */}
                            <col width="15%" />
                            <col width="20%" />
                            <col width="10%" />
                            <col width="20%" />
                            <col width="10%" />
                            <col width="25%" />
                        </colgroup>
                        <tbody>
                            {listExSmartArbitrage && listExSmartArbitrage.length
                                ?
                                listExSmartArbitrage.map((item, key) => {
                                    var secondBal = this.props.secondCurrencyBalance * this.props.selectedPer / 100;
                                    if (this.props.secondCurrencyBalance === 0) {
                                        var firstBal = this.props.firstCurrencyBalance;
                                        secondBal = 0;
                                    } else {
                                        var firstBal = secondBal / item.ProviderBuy.LTP;
                                    }
                                    //secondBal = 1;
                                    return <tr key={key}>
                                        {/* <td>
                                            <div style={{ display: "grid" }}>
                                                {item.GrossProfitPer && item.GrossProfitPer.toFixed(2)} % {" "}{item.Pair.split("_")[1]}
                                                {(firstBal != 0 && secondBal != 0 && firstBal <= this.props.firstCurrencyBalance && secondBal <= this.props.secondCurrencyBalance && this.props.firstCurrencyBalance !== 0 && this.props.secondCurrencyBalance !== 0) &&
                                                    <span className="text-success">{parseFloat(item.GrossProfitValue*firstBal).toFixed(this.props.PriceLength)}{" "}{item.Pair.split("_")[1]}</span>
                                                }
                                            </div>
                                        </td>
                                        <td className="pt-0">{this.props.Fees}</td> */}
                                        <td>
                                            <div style={{ display: "grid" }}>
                                                {item.NetProfitPer && item.NetProfitPer.toFixed(2)} % {" "}{item.Pair.split("_")[1]}
                                                {(firstBal != 0 && secondBal != 0 && firstBal <= this.props.firstCurrencyBalance && secondBal <= this.props.secondCurrencyBalance && this.props.firstCurrencyBalance !== 0 && this.props.secondCurrencyBalance !== 0) &&
                                                    <span className={item.NetProfitPer > 0 ? "text-success" : "text-danger"}>{parseFloat(item.NetProfitValue * firstBal).toFixed(this.props.PriceLength)}{" "}{item.Pair.split("_")[1]}</span>
                                                }
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: "grid" }}>
                                                <span className="text-primary">{item.ProviderBuy && item.ProviderBuy.ProviderName}</span>
                                                <span className="font-weight-bold text-danger">{item.ProviderBuy && item.ProviderBuy.LTP.toFixed(this.props.PriceLength)}</span>
                                            </div>
                                        </td>
                                        <td className="pt-0">{item.Pair.split("_")[0] + " / " + item.Pair.split("_")[1]}</td>
                                        <td>
                                            <div style={{ display: "grid" }}>
                                                <span className="text-primary">{item.ProviderSELL && item.ProviderSELL.ProviderName}</span>
                                                <span className="font-weight-bold text-success">{item.ProviderSELL && item.ProviderSELL.LTP.toFixed(this.props.PriceLength)}</span>
                                            </div>
                                        </td>
                                        {(firstBal != 0 && secondBal != 0 && firstBal <= this.props.firstCurrencyBalance && (secondBal <= this.props.secondCurrencyBalance || (item.Pair.split("_")[1] == 'USDT' && secondBal >= 1)) && this.props.firstCurrencyBalance !== 0 && this.props.secondCurrencyBalance !== 0) &&
                                            <td>
                                                {(item.NetProfitPer && item.NetProfitPer > 0) ?
                                                    <Button
                                                        color="primary"
                                                        varient="raised"
                                                        className="border-0 rounded-0 perverbtn txt btn-arbitrage"
                                                        onClick={(event) => { this.TradeOrder(event, item, firstBal) }}
                                                    >
                                                        <IntlMessages id="button.trade" />
                                                    </Button>
                                                    :
                                                    '-'
                                                }
                                            </td>
                                        }
                                        {(firstBal != 0 && secondBal != 0 && firstBal <= this.props.firstCurrencyBalance && (secondBal <= this.props.secondCurrencyBalance || (item.Pair.split("_")[1] == 'USDT' && secondBal >= 1)) && this.props.firstCurrencyBalance !== 0 && this.props.secondCurrencyBalance !== 0) &&
                                            <td>
                                                <div style={{ display: "grid" }}>
                                                    <span>
                                                        {firstBal && parseFloat(firstBal).toFixed(this.props.AmtLength)}
                                                        {" "} {this.props.firstCurrency}
                                                    </span>
                                                    <span>
                                                        {secondBal && parseFloat(secondBal).toFixed(this.props.PriceLength)}
                                                        {" "} {this.props.secondCurrency}
                                                    </span>
                                                </div>
                                            </td>
                                        }
                                        {(firstBal > this.props.firstCurrencyBalance || secondBal > this.props.secondCurrencyBalance || this.props.firstCurrencyBalance === 0 || this.props.secondCurrencyBalance === 0 || (item.Pair.split("_")[1] == 'USDT' && secondBal < 1)) &&
                                            <td colSpan="2">
                                                {
                                                    ((!firstBal || firstBal > this.props.firstCurrencyBalance) && (!secondBal || secondBal > this.props.secondCurrencyBalance || (item.Pair.split("_")[1] == 'USDT' && secondBal < 1))) ?
                                                        <IntlMessages id={`sidebar.arbiTragePleaseAddBoth`} values={{ Param1: item.Pair.split("_")[0], Param2: item.Pair.split("_")[1] }} />
                                                        : (!firstBal || firstBal > this.props.firstCurrencyBalance) ?
                                                            // "Please Add " + item.Pair.split("_")[0] + " to " + (item.ProviderBuy && item.ProviderBuy.ProviderName) + " balance"
                                                            //"Please Add " + item.Pair.split("_")[0] + " balance"                                                    
                                                            <IntlMessages id={`sidebar.arbiTragePleaseAdd`} values={{ Param1: item.Pair.split("_")[0] }} />
                                                            : (!secondBal || secondBal > this.props.secondCurrencyBalance || (item.Pair.split("_")[1] == 'USDT' && secondBal < 1)) ?
                                                                // "Please Add " + item.Pair.split("_")[1] + " to " + (item.ProviderBuy && item.ProviderBuy.ProviderName) + " balance"
                                                                //"Please Add " + item.Pair.split("_")[1] + " balance"
                                                                <IntlMessages id={`sidebar.arbiTragePleaseAdd`} values={{ Param1: item.Pair.split("_")[1] }} />
                                                                : ''
                                                }
                                                {/* Please Add {this.props.firstCurrency} to {item.ProviderBuy && item.ProviderBuy.ProviderName} balance */}
                                            </td>
                                        }
                                    </tr>
                                })
                                :
                                <tr><td colSpan="6"><IntlMessages id="trading.activeorders.label.nodata" /></td></tr>
                            }
                        </tbody>
                    </Table>
                </Scrollbars>
            </Fragment>
        )
    }
}