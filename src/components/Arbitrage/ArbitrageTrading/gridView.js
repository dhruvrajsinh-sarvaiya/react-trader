import React, { Fragment } from 'react';
import { Button } from 'reactstrap';
import IntlMessages from "Util/IntlMessages";
// import scrollbar
import { Scrollbars } from "react-custom-scrollbars";

// code added by devang parekh for handle image if not found (01-08-2019)
const getImage = function (imageName) {
    try {
        return require('Assets/img/MyAccount/'+ (imageName).toLowerCase() + '.png');
    } catch(e) {
        return require('Assets/img/MyAccount/local.png');
    }    
}
//end

export default class GridView extends React.Component {
    render() {
        const listExSmartArbitrage = this.props.data;
        
        return (
            <Scrollbars className="jbs-scroll grd_scroll" autoHeight autoHeightMin={350} autoHeightMax={350} autoHide>
                <div className="row">
                    {listExSmartArbitrage.map((item, key) => {
                        var secondBal = parseFloat(parseFloat(this.props.secondCurrencyBalance * this.props.selectedPer) / 100).toFixed(8)
                        var firstBal = secondBal / item.ProviderBuy.LTP;
                        if (this.props.secondCurrencyBalance === 0) {
                            firstBal = this.props.firstCurrencyBalance;
                            secondBal = 0;
                        }
                        let buyerProviderImg = getImage(item.ProviderBuy.ProviderName);
                        let sellerProviderImg = getImage(item.ProviderSELL.ProviderName);
                        return (
                            <div className="col-3 grid_area" key={key}>
                                <div className="grid-items">
                                    <table className="tblGrdSmtArbitrage">
                                        <tbody>
                                            <tr>
                                                <td><h2 className="buy-area"><IntlMessages id="trading.placeorder.label.buy" /></h2></td>
                                            </tr>
                                            <tr className="col-12">
                                                <td className="row"><span className="col-5"><IntlMessages id="sidebar.smartArbitrageTicker" /></span><span className="col-1 p-0">:</span><span className="col-6 buy-area">{item.Pair.split("_")[0] + "/" + item.Pair.split("_")[1]}</span></td>
                                            </tr>
                                            <tr className="col-12">
                                                <td className="row"><span className="col-5"><IntlMessages id="sidebar.smartArbitragePrice" /></span><span className="col-1 p-0">:</span><span className="col-6 buy-area">{item.ProviderBuy && item.ProviderBuy.LTP.toFixed(8)}</span></td>
                                            </tr>
                                            <tr className="col-12">
                                                <td className="row"><span className="col-5"><IntlMessages id="sidebar.smartArbitrageExchange" /></span><span className="col-1 p-0">:</span><span className="col-6 buy-area">{item.ProviderBuy && item.ProviderBuy.ProviderName}</span></td>
                                            </tr>
                                           {/*  <tr className="col-12">
                                                <td className="row"><span className="col-5"><IntlMessages id="sidebar.smartArbitrageMinimum" /></span><span className="col-1 p-0">:</span><span className="col-6 text-warning">{'007'}</span></td>
                                            </tr> */}
                                            <tr>
                                                <td>
                                                    <div className="pimg_area">
                                                        <img className="img_item" src={buyerProviderImg} alt={item.ProviderBuy.ProviderName} />
                                                        <i className="zmdi zmdi-swap zmdi-hc-3x" />
                                                        <img className="img_item" src={sellerProviderImg} alt={item.ProviderSELL.ProviderName} />
                                                    </div>
                                                </td>
                                            </tr>
                                            {(firstBal != 0 && secondBal != 0 && firstBal <= this.props.firstCurrencyBalance && (secondBal <= this.props.secondCurrencyBalance || (item.Pair.split("_")[1] === 'USDT' && secondBal >= 1)) && this.props.firstCurrencyBalance !== 0 && this.props.secondCurrencyBalance !== 0  && (item.NetProfitPer && item.NetProfitPer > 0))
                                                ?
                                                <tr>
                                                    <td className="text-center">
                                                        <Button varient="raised" className="btn-success" onClick={(event) => { this.props.TradeOrder(event, item, firstBal) }} > <IntlMessages id="button.trade" /> </Button>
                                                    </td>
                                                </tr>
                                                : <td className="fntBold text-center">
                                                    {
                                                        ((!firstBal || firstBal > this.props.firstCurrencyBalance) && (!secondBal || secondBal > this.props.secondCurrencyBalance || (item.Pair.split("_")[1] === 'USDT' && secondBal < 1)))
                                                        ?
                                                            <IntlMessages id={`sidebar.arbiTragePleaseAddBoth`} values={{ Param1: item.Pair.split("_")[0], Param2: item.Pair.split("_")[1] }} />
                                                        : (!firstBal || firstBal > this.props.firstCurrencyBalance) 
                                                            ? <IntlMessages id={`sidebar.arbiTragePleaseAdd`} values={{ Param1: item.Pair.split("_")[0] }} />
                                                                : (!secondBal || secondBal > this.props.secondCurrencyBalance || (item.Pair.split("_")[1] === 'USDT' && secondBal < 1)) 
                                                                    ? <IntlMessages id={`sidebar.arbiTragePleaseAdd`} values={{ Param1: item.Pair.split("_")[1] }} />
                                                                    : ''
                                                    }
                                                </td>
                                            }
                                            <tr>
                                                <td><h2 className="sell-area"><IntlMessages id="trading.placeorder.label.sell" /></h2></td>
                                            </tr>
                                            <tr className="col-12">
                                                <td className="row"><span className="col-5"><IntlMessages id="sidebar.smartArbitrageTicker" /></span><span className="col-1 p-0">:</span><span className="col-6 sell-area">{item.Pair.split("_")[0] + "/" + item.Pair.split("_")[1]}</span></td>
                                            </tr>
                                            <tr className="col-12">
                                                <td className="row"><span className="col-5"><IntlMessages id="sidebar.smartArbitragePrice" /></span><span className="col-1 p-0">:</span><span className="col-6 sell-area">{item.ProviderSELL && item.ProviderSELL.LTP.toFixed(8)}</span></td>
                                            </tr>
                                            <tr className="col-12">
                                                <td className="row"><span className="col-5"><IntlMessages id="sidebar.smartArbitrageExchange" /></span><span className="col-1 p-0">:</span><span className="col-6 sell-area">{item.ProviderSELL && item.ProviderSELL.ProviderName}</span></td>
                                            </tr>
                                            <tr className="col-12">
                                                <td className="row"><span className="col-5"><IntlMessages id="sidebar.smartArbitrageProfit" /></span><span className="col-1 p-0">:</span><span className={(item.NetProfitPer && item.NetProfitPer > 0) ? "col-6 sell-area" : "col-6 buy-area"}>{item.NetProfitPer && item.NetProfitPer.toFixed(2)} % {" "}{item.Pair.split("_")[1]}</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Scrollbars>
        )
    }
}