/**
 * Author : Parth Andhariya
 * Created : 12/06/2019
 *  Arbitrage Analytics 
*/
import React, { Fragment, Component } from 'react';
import { connect } from "react-redux";
import IntlMessages from 'Util/IntlMessages';
import classNames from 'classnames';
import { Input } from 'reactstrap';
import AppConfig from 'Constants/AppConfig';
// jbs section loader
import JbsSectionLoader from 'Components/JbsSectionLoader/JbsSectionLoader';
import JbsCollapsibleCard from 'Components/JbsCollapsibleCard/JbsCollapsibleCard';
import { Line } from 'react-chartjs-2';
import ChartConfig from 'Constants/chart-config';
import { hexToRgbA } from 'Helpers/helpers';
import { JbsCard, JbsCardContent } from 'Components/JbsCard';
import CountUp from 'react-countup';
import {
    getAnalyticGraphRecord,
    getArbitrageCurrencyList,
    getArbitrageWalletList
} from 'Actions/Arbitrage';
import {
    FormGroup,
    Label,
} from "reactstrap";
import Select from "react-select";

// options
const options = {
    elements: {
        point: {
            radius: 0
        }
    },
    legend: {
        display: false,
        labels: {
            fontColor: ChartConfig.legendFontColor
        }
    },
    scales: {
        xAxes: [{
            gridLines: {
                offsetGridLines: true,
                display: false
            },
            ticks: {
                fontColor: ChartConfig.axesColor
            }
        }],
        yAxes: [{
            // display: false,
            gridLines: {
                drawBorder: false,
                zeroLineColor: ChartConfig.chartGridColor
            },
            ticks: {
                fontColor: ChartConfig.axesColor,
                min: 0,
                callback: function (value, index, values) {
                    if (Math.floor(value) === value) {
                        return value;
                    }
                }
            }
        }]
    }
};

class Analytics extends Component {
    //set initial state...
    constructor(props) {
        super(props);
        this.state = {
            TotalBalance: 0.0,
            DailyLimit: 0.0,
            UsedLimit: 0.0,
            balanceList: [],
            hideZero: false,
            search: '',
            isSearch: false,
            currency: "",
            WalletObj: {}
        };
    }
    //onchange handle
    onChangeHandler(e) {
        // this.setState({ [key]: value }, () => this.props.getAnalyticGraphRecord({ CurrencyName: value }));
        this.setState({ currency: e.value, WalletObj: { label: e.label } }, () => this.props.getAnalyticGraphRecord({ CurrencyName: e.value }));
    }
    //will mount data binding...
    componentWillMount() {
        // this.props.getArbitrageCurrencyList();
        this.props.getArbitrageWalletList({})
    }
    //will recieve props update states...
    componentWillReceiveProps(nextprops) {
        // load first currency on page load
        if (nextprops.walletList.length && this.state.currency === '') {
            var e = {
                label: nextprops.walletList[0].WalletName,
                value: nextprops.walletList[0].CoinName,
            };
            this.onChangeHandler(e);
        }
    }
    render() {
        const { analyticData, intl } = this.props;
        const ChargesTypesData = {
            labels: analyticData.hasOwnProperty('DayMonth') ? analyticData.DayMonth : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Amount',
                    fill: true,
                    lineTension: 0.3,
                    fillOpacity: 0.3,
                    backgroundColor: hexToRgbA(ChartConfig.color.info, 0.1),
                    borderColor: hexToRgbA(ChartConfig.color.info, 3),
                    borderWidth: 3,
                    pointBackgroundColor: hexToRgbA(ChartConfig.color.info, 3),
                    pointBorderWidth: 2,
                    pointRadius: 2,
                    pointBorderColor: ChartConfig.color.info,
                    pointHoverRadius: 4,
                    pointHoverBorderWidth: 2,
                    data: analyticData.hasOwnProperty('AmountArray') ? analyticData.AmountArray : []
                },
                {
                    label: 'USD',
                    fill: true,
                    lineTension: 0.3,
                    fillOpacity: 0.3,
                    backgroundColor: hexToRgbA(ChartConfig.color.warning, 0.1),
                    borderColor: hexToRgbA(ChartConfig.color.warning, 3),
                    borderWidth: 3,
                    pointBackgroundColor: hexToRgbA(ChartConfig.color.warning, 3),
                    pointBorderWidth: 2,
                    pointRadius: 2,
                    pointBorderColor: ChartConfig.color.warning,
                    pointHoverRadius: 4,
                    pointHoverBorderWidth: 2,
                    data: analyticData.hasOwnProperty('USDAmountArray') ? analyticData.USDAmountArray : []
                }
            ],
            customLegends: [
                {
                    name: 'Amount',
                    className: 'badge-info'
                },
                {
                    name: 'USD',
                    className: 'badge-warning'
                }
            ]
        }
        return (
            <div className="fnd_blnc_area">
                {(this.props.loading || this.props.walletLoading) && <JbsSectionLoader />}
                <div className="row d-flex justify-content-between">
                    <div className="w-20 d-flex pl-20 pb-10 justify-content-between srch_area">
                        <div className="col-sm-12 mb-0">
                            {/* <Input type="select" name="currency" id="currency" value={this.state.currency} onChange={(e) => this.onChangeHandler(e.target.value, 'currency')}>
                                <option value="">{intl.formatMessage({ id: "wallet.selectCurrency" })}</option>
                                {this.props.currencyList.length !== 0 && this.props.currencyList.map((curr, index) => (
                                    <option key={index} value={curr.CoinName}>{curr.CoinName}</option>
                                ))}
                            </Input> */}
                            <FormGroup className="">
                                <Label for="Select-1">{intl.formatMessage({ id: "wallet.Wallet" })}<span className="text-danger">*</span></Label>
                                <Select
                                    options={this.props.walletList.map((type) => ({
                                        label: type.WalletName,
                                        value: type.CoinName,
                                    }))}
                                    onChange={e => this.onChangeHandler(e)}
                                    value={this.state.WalletObj}
                                />
                            </FormGroup>
                        </div>
                    </div>
                </div>

                <div className="row mx-0 mt-10">
                    <div
                        className={classNames({ 'fundbalancedivcard_darkmode': this.props.darkMode }, "col-sm-6 col-md-4 col-lg-4 w-xs-half-block")}
                    >
                        <JbsCard colClasses="col-sm-full">
                            <JbsCardContent>
                                <div className="d-flex justify-content-between">
                                    <div className="align-items-end">
                                        <h1 className="accountcommoncard display-4 font-weight-light">
                                            <img
                                                // src={getImage}
                                                src={AppConfig.coinlistImageurl + '/' + this.state.currency + '.png'}
                                                style={{ width: "55px" }}
                                                alt={this.state.currency}
                                                className="rounded-circle"
                                                onError={(e) => {
                                                    e.target.src = require(`Assets/icon/default.png`) // default img
                                                }}
                                            />
                                        </h1>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-uppercase py-10 fw-bold">{<IntlMessages id="arbitrage.Amount" />}</h2>
                                        <span className="font-lg ml-10">{analyticData.hasOwnProperty('Amount') ? parseFloat(analyticData.Amount).toFixed(8) : "0.00000000"}</span>
                                        <span className="font-lg ml-10">{this.state.currency}</span>
                                    </div>
                                </div>
                            </JbsCardContent>
                        </JbsCard>
                    </div>
                    <div
                        className={classNames({ 'fundbalancedivcard_darkmode': this.props.darkMode }, "col-sm-6 col-md-4 col-lg-4 w-xs-half-block")}
                    >
                        <JbsCard colClasses="col-sm-full">
                            <JbsCardContent>
                                <div className="d-flex justify-content-between">
                                    <div className="align-items-end">
                                        <h1 className="accountcommoncard display-4 font-weight-light"><i className={"fa fa-usd"}></i></h1>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-uppercase py-10 fw-bold">{<IntlMessages id="arbitrage.totalValue" />}</h2>
                                        <span className="font-lg ml-10">{analyticData.hasOwnProperty('USDTotalAmount') ? parseFloat(analyticData.USDTotalAmount).toFixed(2) : "0.00"}</span>
                                        <span className="font-lg ml-10">{"USD"}</span>
                                    </div>
                                </div>
                            </JbsCardContent>
                        </JbsCard>
                    </div>
                    <div
                        className={classNames({ 'fundbalancedivcard_darkmode': this.props.darkMode }, "col-sm-6 col-md-4 col-lg-4 w-xs-half-block")}
                    >
                        <JbsCard colClasses="col-sm-full">
                            <JbsCardContent>
                                <div className="d-flex justify-content-between">
                                    <div className="align-items-end">
                                        <h1 className="accountcommoncard display-4 font-weight-light"><i className={"fa fa-usd"}></i></h1>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-uppercase py-10 fw-bold">{<IntlMessages id="arbitrage.TotalChanges" />}</h2>
                                        {analyticData.hasOwnProperty('TotalChange') ?
                                            ((analyticData.TotalChange.Percentage === 0.0 && analyticData.TotalChange.Change !== 0.0) ?
                                                <span className={classNames("font-lg ml-10")}>{"N/A"}</span>
                                                :
                                                <span className={classNames({ 'text-success': (analyticData.TotalChange.IsProfit === 1) }, { 'text-danger': (analyticData.TotalChange.IsProfit === 2) }, "font-lg ml-10")}>
                                                    {analyticData.TotalChange.IsProfit === 1 ? "+" : ""}
                                                    {analyticData.hasOwnProperty('TotalChange') ? parseFloat(analyticData.TotalChange.Percentage).toFixed(2) : "0.00"}{"%"}
                                                </span>) :
                                            <span className={classNames("font-lg ml-10")}>
                                                <CountUp separator="," start={0} end={0.00} />{"%"}
                                            </span>}
                                        <span className="font-lg ml-10">
                                            {(analyticData.hasOwnProperty('TotalChange') && analyticData.TotalChange.IsProfit === 1) ? "+" : ""}
                                            {analyticData.hasOwnProperty('TotalChange') ? parseFloat(analyticData.TotalChange.USDChange).toFixed(2) : "0.00"}
                                        </span>
                                        <span className="font-lg ml-10">{"USD"}</span>
                                    </div>
                                </div>
                            </JbsCardContent>
                        </JbsCard>
                    </div>
                    <div
                        className={classNames({ 'fundbalancedivcard_darkmode': this.props.darkMode }, "col-sm-6 col-md-4 col-lg-4 w-xs-half-block")}
                    >
                        <JbsCard colClasses="col-sm-full">
                            <JbsCardContent>
                                <div className="d-flex justify-content-between">
                                    <div className="align-items-end">
                                        <h1 className="accountcommoncard display-4 font-weight-light"><i className={"fa fa-usd"}></i></h1>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-uppercase py-10 fw-bold">{<IntlMessages id="arbitrage.TotalChange24H" />}</h2>
                                        {analyticData.hasOwnProperty('TotalChange24H') ?
                                            ((analyticData.TotalChange24H.Percentage === 0.0 && analyticData.TotalChange24H.Change !== 0.0) ?
                                                <span className={classNames("font-lg ml-10")}>{"N/A"}</span>
                                                :
                                                <span className={classNames({ 'text-success': (analyticData.TotalChange24H.IsProfit === 1) }, { 'text-danger': (analyticData.TotalChange24H.IsProfit === 2) }, "font-lg ml-10")}>
                                                    {analyticData.TotalChange24H.IsProfit === 1 ? "+" : ""}
                                                    {analyticData.hasOwnProperty('TotalChange24H') ? parseFloat(analyticData.TotalChange24H.Percentage).toFixed(2) : "0.00"}{"%"}
                                                </span>) :
                                            <span className={classNames("font-lg ml-10")}>
                                                <CountUp separator="," start={0} end={0.00} />{"%"}
                                            </span>}
                                        <span className="font-lg ml-10">
                                            {(analyticData.hasOwnProperty('TotalChange24H') && analyticData.TotalChange24H.IsProfit === 1) ? "+" : ""}
                                            {analyticData.hasOwnProperty('TotalChange24H') ? parseFloat(analyticData.TotalChange24H.USDChange).toFixed(2) : "0.00"}
                                        </span>
                                        <span className="font-lg ml-10">{"USD"}</span>
                                    </div>
                                </div>
                            </JbsCardContent>
                        </JbsCard>
                    </div>
                    <div
                        className={classNames({ 'fundbalancedivcard_darkmode': this.props.darkMode }, "col-sm-6 col-md-4 col-lg-4 w-xs-half-block")}
                    >
                        <JbsCard colClasses="col-sm-full">
                            <JbsCardContent>
                                <div className="d-flex justify-content-between">
                                    <div className="align-items-end">
                                        <h1 className="accountcommoncard display-4 font-weight-light"><i className={"fa fa-usd"}></i></h1>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-uppercase py-10 fw-bold">{<IntlMessages id="arbitrage.TotalChange7D" />}</h2>
                                        {analyticData.hasOwnProperty('TotalChange7D') ?
                                            ((analyticData.TotalChange7D.Percentage === 0.0 && analyticData.TotalChange7D.Change !== 0.0) ?
                                                <span className={classNames("font-lg ml-10")}>{"N/A"}</span>
                                                :
                                                <span className={classNames({ 'text-success': (analyticData.TotalChange7D.IsProfit === 1) }, { 'text-danger': (analyticData.TotalChange7D.IsProfit === 2) }, "font-lg ml-10")}>
                                                    {analyticData.TotalChange7D.IsProfit === 1 ? "+" : ""}
                                                    {analyticData.hasOwnProperty('TotalChange7D') ? parseFloat(analyticData.TotalChange7D.Percentage).toFixed(2) : "0.00"}{"%"}
                                                </span>) :
                                            <span className={classNames("font-lg ml-10")}>
                                                <CountUp separator="," start={0} end={0.00} />{"%"}
                                            </span>}
                                        <span className="font-lg ml-10">
                                            {(analyticData.hasOwnProperty('TotalChange7D') && analyticData.TotalChange7D.IsProfit === 1) ? "+" : ""}
                                            {analyticData.hasOwnProperty('TotalChange7D') ? parseFloat(analyticData.TotalChange7D.USDChange).toFixed(2) : "0.00"}
                                        </span>
                                        <span className="font-lg ml-10">{"USD"}</span>
                                    </div>
                                </div>
                            </JbsCardContent>
                        </JbsCard>
                    </div>
                    <div
                        className={classNames({ 'fundbalancedivcard_darkmode': this.props.darkMode }, "col-sm-6 col-md-4 col-lg-4 w-xs-half-block")}
                    >
                        <JbsCard colClasses="col-sm-full">
                            <JbsCardContent>
                                <div className="d-flex justify-content-between">
                                    <div className="align-items-end">
                                        <h1 className="accountcommoncard display-4 font-weight-light"><i className={"fa fa-usd"}></i></h1>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-uppercase py-10 fw-bold">{<IntlMessages id="arbitrage.TotalChange30D" />}</h2>
                                        {analyticData.hasOwnProperty('TotalChange30D') ?
                                            ((analyticData.TotalChange30D.Percentage === 0.0 && analyticData.TotalChange30D.Change !== 0.0) ?
                                                <span className={classNames("font-lg ml-10")}>{"N/A"}</span>
                                                :
                                                <span className={classNames({ 'text-success': (analyticData.TotalChange30D.IsProfit === 1) }, { 'text-danger': (analyticData.TotalChange30D.IsProfit === 2) }, "font-lg ml-10")}>
                                                    {analyticData.TotalChange30D.IsProfit === 1 ? "+" : ""}
                                                    {analyticData.hasOwnProperty('TotalChange30D') ? parseFloat(analyticData.TotalChange30D.Percentage).toFixed(2) : "0.00"}{"%"}
                                                </span>) :
                                            <span className={classNames("font-lg ml-10")}>
                                                <CountUp separator="," start={0} end={0.00} />{"%"}
                                            </span>}
                                        <span className="font-lg ml-10">
                                            {(analyticData.hasOwnProperty('TotalChange30D') && analyticData.TotalChange30D.IsProfit === 1) ? "+" : ""}
                                            {analyticData.hasOwnProperty('TotalChange30D') ? parseFloat(analyticData.TotalChange30D.USDChange).toFixed(2) : "0.00"}
                                        </span>
                                        <span className="font-lg ml-10">{"USD"}</span>
                                    </div>
                                </div>
                            </JbsCardContent>
                        </JbsCard>
                    </div>
                </div>
                <div className="col-sm-12 mt-10 px-10">
                    <JbsCollapsibleCard>
                        <div className="chart-top d-flex justify-content-between display-n p-20">
                            <div className="d-flex align-items-start">
                            </div>
                            <div className="d-flex align-items-end">
                                {ChargesTypesData.customLegends.map((legend, key) => (
                                    <Fragment key={key}>
                                        <span className={`${legend.className} badge-sm`}>&nbsp;</span>
                                        <span className="fs-12">{legend.name}</span>
                                    </Fragment>
                                ))}
                            </div>
                        </div>
                        <Line data={ChargesTypesData} options={options} height={50} />
                    </JbsCollapsibleCard>
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({ ArbitrageWalletReducer, AnalyticReducer }) => {
    // const { currencyList } = ArbitrageWalletReducer;
    // const currencyLoading = ArbitrageWalletReducer.loading;
    const { loading, analyticData } = AnalyticReducer;
    const { walletList } = ArbitrageWalletReducer;
    const walletLoading = ArbitrageWalletReducer.loading;
    return { walletList, loading, analyticData, walletLoading };
}
export default connect(mapStateToProps, {
    getArbitrageCurrencyList,
    getArbitrageWalletList,
    getAnalyticGraphRecord
})(Analytics);