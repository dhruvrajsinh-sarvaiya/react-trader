// Component for Limit Place Order Detail By:Tejas Date : 13/9/2018

import React from "react";
import JbsSectionLoader from "Components/JbsPageLoader/JbsLoader";
import { AddMarginBalance } from 'Components/MarginTrading';
import {
  validateBuyPrice,
  validateBuyAmount,
  validateBuyTotal,
  validateSellPrice,
  validateSellAmount,
  validateSellTotal,
  validateOnlyNumeric,
  validateBuyData,
  validateSellData
} from "../../../validation/vaildateBuySellRequest";

import { Button, Form, FormGroup, Label, Input, Row, Col } from "reactstrap";

// function for connect store
import { connect } from "react-redux";

import { doBuyOrder, doSellOrder, updateBalance } from "Actions/Trade";

// intl messages
import IntlMessages from "Util/IntlMessages";

// Used For Set Conditional Base Classes
import classnames from "classnames";

//  Used For Display Notification 
import { NotificationManager } from "react-notifications";

// Used To Display Progressbar on Buy/Sell Button
import CircularProgress from '@material-ui/core/CircularProgress';

class LimitOrder extends React.Component {  
  state = {
    modalSell: false,
    modalBuy: false,
    modalInfo: 0,

    selectedSellValue: 0,
    selectedBuyValue: 0,

    isPriceBuyValid: true,
    isAmountBuyValid: true,
    isTotalBuyValid: true,

    isPriceSellValid: true,
    isAmountSellValid: true,
    isTotalSellValid: true,

    priceBuyError: "",
    amountBuyError: "",
    totalBuyError: "",

    priceSellError: "",
    amountSellError: "",
    totalSellError: "",

    priceBuy: (this.props.currentPrice.LastPrice) ? parseFloat(this.props.currentPrice.LastPrice).toFixed(8) : parseFloat(0).toFixed(8),
    amountBuy: "",
    totalBuy: "",

    priceSell: (this.props.currentPrice.LastPrice) ? parseFloat(this.props.currentPrice.LastPrice).toFixed(8) : parseFloat(0).toFixed(8),
    amountSell: "",
    totalSell: "",
    orderType: "",
    showLoader: false,
    buyOrderResponse: [],
    sellOrderResponse: [],

    buyLimitOrderBit: 0,
    sellLimitOrderBit: 0,

    firstCurrencyBalance: 0,
    secondCurrencyBalance: 0,

    bulkSellOrder: [],
    bulkBuyOrder: [],

    errorLimit: '',
    lastPriceBit: 0
  };

  // handle close add new Schedule dailog
  handleClose() {

    this.setState({
      modalBuy: false,
      modalSell: false,
      buyOrderResponse: [],
      sellOrderResponse: [],
      buyLimitOrderBit: 0,
      sellLimitOrderBit: 0
    });
  }

  componentWillReceiveProps(nextprops) {

    if (nextprops.currentPrice && nextprops.currentPrice.LastPrice && this.state.lastPriceBit !== nextprops.lastPriceBit) {

      this.setState({
        priceBuy: parseFloat(nextprops.currentPrice.LastPrice).toFixed(8),
        priceSell: parseFloat(nextprops.currentPrice.LastPrice).toFixed(8),
        lastPriceBit: nextprops.lastPriceBit,
        amountBuy: "",
        //totalBuy:"",
        amountSell: "",
        //totalSell:""
      })

    }
    
    if (nextprops.bulkBuyOrder && nextprops.bulkBuyOrder.Price !== '-' && nextprops.bulkBuyOrder.Price && nextprops.bulkBuyOrder.Amount && nextprops.bulkBuyOrder.Total) {

      if (nextprops.bulkBuyOrder.Price !== this.props.bulkBuyOrder.Price &&
        nextprops.bulkBuyOrder.Amount !== this.props.bulkBuyOrder.Amount &&
        nextprops.bulkBuyOrder.Total !== this.props.bulkBuyOrder.Total
      ) {
        this.setState({
          priceBuy: parseFloat(nextprops.bulkBuyOrder.Price).toFixed(8),
          amountBuy: parseFloat(nextprops.bulkBuyOrder.Amount).toFixed(8),
          totalBuy: nextprops.bulkBuyOrder.Total
        })
      }
    }
    if (nextprops.bulkSellOrder && nextprops.bulkSellOrder.Price !== '-' && nextprops.bulkSellOrder.Price && nextprops.bulkSellOrder.Amount && nextprops.bulkSellOrder.Total) {

      if (nextprops.bulkSellOrder.Price !== this.props.bulkSellOrder.Price &&
        nextprops.bulkSellOrder.Amount !== this.props.bulkSellOrder.Amount &&
        nextprops.bulkSellOrder.Total !== this.props.bulkSellOrder.Total
      ) {
        this.setState({
          priceSell: parseFloat(nextprops.bulkSellOrder.Price).toFixed(8),
          amountSell: parseFloat(nextprops.bulkSellOrder.Amount).toFixed(8),
          totalSell: nextprops.bulkSellOrder.Total
        })
      }
    }
    
    if (nextprops.buyOrder && nextprops.error.length == 0) {

      if (this.state.buyLimitOrderBit) {

        if (nextprops.buyOrder.statusCode == 200 && nextprops.buyOrder.ErrorCode == 4566) {

          NotificationManager.success(<IntlMessages id={`trading.orders.orders.trnid`} values={nextprops.buyOrder.response} />);

        } else if (nextprops.buyOrder.statusCode == 200 && nextprops.buyOrder.ErrorCode == 4568) {

          NotificationManager.error(<IntlMessages id="error.trading.transaction.4568" />)
        }

        this.setState({
          buyOrderResponse: nextprops.buyOrder.response,
          sellOrderResponse: [],
          showLoader: false,
          modalBuy: true,
          modalSell: false,        
          errorLimit: "",
          buyLimitOrderBit: 0
        });
       
      } else {
        this.setState({
          buyOrderResponse: []
        })        
      }
    } else if (nextprops.error.ReturnCode !== 0 && this.state.buyLimitOrderBit) {
      
      NotificationManager.error(<IntlMessages id={`error.trading.transaction.${nextprops.error.ErrorCode}`} />);
      if (nextprops.error.ReturnCode === 9) {

        NotificationManager.error(<IntlMessages id="placeorder.buysell.error.internalerror" />)
      }
     

      this.setState({
        errorLimit: nextprops.error.ReturnMsg,
        buyOrderResponse: [],
        buyLimitOrderBit: 0,       
      })      
    }
   
    if (nextprops.sellOrder && nextprops.error.length == 0) {

      if (this.state.sellLimitOrderBit) {

        if (nextprops.sellOrder.statusCode == 200 && nextprops.sellOrder.ErrorCode == 4566) {

          NotificationManager.success(<IntlMessages id={`trading.orders.orders.trnid`} values={nextprops.sellOrder.response} />);
        } else if (nextprops.sellOrder.statusCode == 200 && nextprops.sellOrder.ErrorCode == 4568) {

          NotificationManager.error(<IntlMessages id="error.trading.transaction.4568" />)
        }

        this.setState({
          sellOrderResponse: nextprops.sellOrder.response,
          buyOrderResponse: [],
          showLoader: false,
          modalSell: true,
          errorLimit: "",
          sellLimitOrderBit: 0
        });

      } else {
        this.setState({
          sellOrderResponse: []
        })
      }
    } else if (nextprops.error.ReturnCode !== 0 && this.state.sellLimitOrderBit) {

      NotificationManager.error(<IntlMessages id={`error.trading.transaction.${nextprops.error.ErrorCode}`} />);

      if (nextprops.error.ReturnCode === 9) {

        NotificationManager.error(<IntlMessages id="placeorder.buysell.error.internalerror" />)
      }


            this.setState({
        errorLimit: nextprops.error.ReturnMsg,
        sellOrderResponse: [],
        sellLimitOrderBit: 0,       
      })      
    }

  }

  validateBuyPrice = event => {
    
    if (validateOnlyNumeric(event.target.value)) {
      this.setState({ priceBuy: event.target.value });
      const { isValid, errors } = validateBuyPrice(event.target.value);
      if (isValid) {
        this.setState({ isPriceBuyValid: true });

        if (this.state.amountBuy != "" && this.state.isAmountBuyValid) {
          this.setState({
            totalBuy: parseFloat(
              parseFloat(this.state.amountBuy) * parseFloat(event.target.value)
            ).toFixed(8),
            isTotalBuyValid: true
          });
        } else {
          this.setState({ totalBuy: "", isTotalBuyValid: true });
        }
      } else {
        this.setState({
          isPriceBuyValid: false,
          priceBuyError: errors.buyPrice,
          total: ""
        });
      }
    } else if (event.target.value == "") {
      // process for blank message
      this.setState({ priceBuy: event.target.value, totalBuy: "" });
    }
  };

  validateBuyAmount = event => {
    
    if (validateOnlyNumeric(event.target.value)) {
      const { isValid, errors } = validateBuyAmount(event.target.value);

      this.setState({ amountBuy: event.target.value });

      if (isValid) {
        this.setState({ isAmountBuyValid: true });

        if (this.state.priceBuy != "" && this.state.isPriceBuyValid) {
          this.setState({
            totalBuy: parseFloat(
              parseFloat(event.target.value) * parseFloat(this.state.priceBuy)
            ).toFixed(8),
            isTotalBuyValid: true
          });
        } else {
          this.setState({ totalBuy: "", isTotalBuyValid: true });
        }
      } else {
        this.setState({
          isAmountBuyValid: false,
          amountBuyError: errors.buyAmount,
          totalBuy: ""
        });
      }
    } else if (event.target.value == "") {
      // process for blank message
      this.setState({
        amountBuy: event.target.value,
        total: "",
        totalBuy: ""
      });
    }
  };

  validateBuyTotal = event => {
    
    if (validateOnlyNumeric(event.target.value)) {
      this.setState({ totalBuy: event.target.value });

      const { isValid, errors } = validateBuyTotal(event.target.value);
      if (isValid) {
        this.setState({ isTotalBuyValid: true });

        // calculation process of Amount
        if (
          this.state.priceBuy != "" &&
          this.state.isPriceBuyValid &&
          this.state.totalBuy !== 0
        ) {
          this.setState({
            amountBuy: parseFloat(
              parseFloat(event.target.value) / parseFloat(this.state.priceBuy)
            ).toFixed(8),
            isAmountBuyValid: true
          });
        } else {
          this.setState({ amountBuy: "", isAmountBuyValid: true });
        }
      } else {
        this.setState({
          isTotalBuyValid: false,
          totalBuyError: errors.buyTotal
        });
      }
    } else if (event.target.value == "") {
      // process for blank message
      this.setState({ totalBuy: event.target.value, total: "", amountBuy: "" });
    }
  };

  validateSellPrice = event => {
    
    if (validateOnlyNumeric(event.target.value)) {
      this.setState({ priceSell: event.target.value });

      const { isValid, errors } = validateSellPrice(event.target.value);

      if (isValid) {
        this.setState({ isPriceSellValid: true });

        if (this.state.amountSell != "" && this.state.isAmountSellValid) {
          this.setState({
            totalSell: parseFloat(
              parseFloat(this.state.amountSell) * parseFloat(event.target.value)
            ).toFixed(8),
            isTotalSellValid: true
          });
        } else {
          this.setState({ totalSell: "", isTotalSellValid: true });
        }
      } else {
        this.setState({
          isPriceSellValid: false,
          priceSellError: errors.sellPrice,
          total: ""
        });
      }
    } else if (event.target.value == "") {
      // process for blank message
      this.setState({ priceSell: event.target.value, totalSell: "" });
    }
  };

  validateSellAmount = event => {
    
    if (validateOnlyNumeric(event.target.value)) {
      const { isValid, errors } = validateSellAmount(event.target.value);

      this.setState({ amountSell: event.target.value });

      if (isValid) {
        this.setState({ isAmountSellValid: true });
        if (this.state.priceSell != "" && this.state.isPriceSellValid) {
          this.setState({
            totalSell: parseFloat(
              parseFloat(event.target.value) * parseFloat(this.state.priceSell)
            ).toFixed(8),
            isTotalSellValid: true
          });
        } else {
          this.setState({ totalSell: "", isTotalSellValid: true });
        }
      } else {
        this.setState({
          isAmountSellValid: false,
          amountSellError: errors.sellAmount,
          totalSell: ""
        });
      }
    } else if (event.target.value == "") {
      // process for blank message
      this.setState({
        amountSell: event.target.value,
        total: "",
        totalSell: ""
      });
    }
  };

  validateSellTotal = event => {
    
    if (validateOnlyNumeric(event.target.value)) {
      this.setState({ totalSell: event.target.value });

      const { isValid, errors } = validateSellTotal(event.target.value);
      if (isValid) {
        this.setState({ isTotalSellValid: true });

        if (
          this.state.priceSell != "" &&
          this.state.isPriceSellValid &&
          this.state.totalSell !== 0
        ) {
          this.setState({
            amountSell: parseFloat(
              event.target.value / parseFloat(this.state.priceSell)
            ).toFixed(8),
            isAmountSellValid: true
          });
        } else {
          this.setState({ amountSell: "", isAmountSellValid: true });
        }
      } else {
        this.setState({
          isTotalSellValid: false,
          totalSellError: errors.sellTotal
        });
      }
    } else if (event.target.value == "") {
      // process for blank message
      this.setState({
        totalSell: event.target.value,
        total: "",
        amountSell: ""
      });
    }
  };

  changeSelectedBuyValue = value => {
    if (this.state.selectedBuyValue === value) {
      
    } else {
      
      // calculation process of Amount
      if (
        this.state.priceBuy != "" &&
        this.state.isPriceBuyValid &&
        this.state.totalBuy !== 0 &&
        this.state.amountBuy !== 0
      ) {
        
        var total = parseFloat(
          parseFloat(
            parseFloat(this.props.secondCurrencyBalance) * parseFloat(value)
          ) / 100
        ).toFixed(8);
        this.setState({
          amountBuy: parseFloat(
            parseFloat(total) / parseFloat(this.state.priceBuy)
          ).toFixed(8),
          totalBuy: total,
          isAmountBuyValid: true,
          isTotalBuyValid: true
        });
      } else {
        this.setState({
          amountBuy: "",
          totalBuy: "",
          isTotalBuyValid: true,
          isAmountBuyValid: true
        });
      }
    }
  };

  changeSelectedSellValue = value => {
    if (this.state.selectedSellValue === value) {
      
    } else {
      
      // calculation process of Amount
      if (
        this.state.priceSell != "" &&
        this.state.isPriceSellValid &&
        this.state.totalSell !== 0 &&
        this.state.amountSell !== 0
      ) {
        
        var amount = parseFloat(
          parseFloat(
            parseFloat(this.props.firstCurrencyBalance) * parseFloat(value)
          ) / 100
        ).toFixed(8);
        this.setState({
          totalSell: parseFloat(
            parseFloat(this.state.priceSell) * parseFloat(amount)
          ).toFixed(8),
          amountSell: amount,
          isAmountSellValid: true,
          isTotalSellValid: true
        });
      } else {
        this.setState({
          amountSell: "",
          totalSell: "",
          isTotalSellValid: true,
          isAmountSellValid: true
        });
      }
    }
  };

  doSellOrder = event => {
    event.preventDefault();
    const info = this.props.info;
    if (this.state.priceSell == '' || typeof this.state.priceSell === undefined || this.state.priceSell == 0) {

      this.setState({ showLoader: false, sellLimitOrderBit: 0 });
      NotificationManager.error(<IntlMessages id="error.trading.transaction.4607" />);
    } else if (this.state.amountSell == '' || typeof this.state.amountSell === undefined || this.state.amountSell == 0) {
      this.setState({ showLoader: false, sellLimitOrderBit: 0 });
      NotificationManager.error(<IntlMessages id="error.trading.transaction.4608" />);
    } else if (this.state.totalSell == '' || typeof this.state.totalSell === undefined || this.state.totalSell == 0) {

      this.setState({ showLoader: false, sellLimitOrderBit: 0 });
      NotificationManager.error(<IntlMessages id="error.trading.transaction.4609" />);
    } else if (info.currencyPairID == '' || typeof info.currencyPairID === undefined || info.currencyPairID == 0) {

      this.setState({ showLoader: false, sellLimitOrderBit: 0 });
      NotificationManager.error(<IntlMessages id="error.trading.transaction.4601" />);
    } else if (this.props.secondCurrencyWalletId == '' || typeof this.props.secondCurrencyWalletId === undefined || this.props.secondCurrencyWalletId == 0) {

      this.setState({ showLoader: false, sellLimitOrderBit: 0 });
      NotificationManager.error(<IntlMessages id="error.trading.creditwallet" />);
    } else if (this.props.firstCurrencyWalletId == '' || typeof this.props.firstCurrencyWalletId === undefined || this.props.firstCurrencyWalletId == 0) {

      this.setState({ showLoader: false, sellLimitOrderBit: 0 });
      NotificationManager.error(<IntlMessages id="error.trading.debitwallet" />);
    } else {
      const data = {
        currencyPairID: info.currencyPairID,
        debitWalletID: this.props.firstCurrencyWalletId,
        creditWalletID: this.props.secondCurrencyWalletId,
        fee: 0,
        trnMode: 21,
        price: this.state.priceSell,
        amount: this.state.amountSell,
        total: this.state.totalSell,
        ordertype: 1,
        orderSide: 5,
        StopPrice: 0,
        Pair: this.props.firstCurrency + '_' + this.props.secondCurrency,
        marginOrder: this.props.marginTrading
      };

      const { isValid, errors } = validateSellData(data);
      if (!isValid) {
        if (errors.sellPrice) {
          this.setState({
            isPriceSellValid: false,
            priceSellError: errors.sellPrice,
            total: ""
          });
        }

        if (errors.sellAmount) {
          this.setState({
            isAmountSellValid: false,
            amountSellError: errors.sellAmount,
            totalSell: ""
          });
        }

        if (errors.sellTotal) {
          this.setState({
            isTotalSellValid: false,
            totalSellError: errors.sellTotal
          });
        }
      } else {
        if (
          this.state.isAmountSellValid &&
          this.state.isPriceSellValid &&
          this.state.isTotalSellValid
        ) {

          this.setState({
            buyLimitOrderBit: 0,
            sellLimitOrderBit: 1
          })

          if (this.state.amountSell <= this.props.firstCurrencyBalance) {

            this.props.doSellOrder(data);
          } else {

            this.setState({ showLoader: false, sellLimitOrderBit: 0 });
            NotificationManager.error(
              <IntlMessages id="trading.placeorder.error.minBalance" />
            );
          }
        } else {

          this.setState({ showLoader: false, sellLimitOrderBit: 0 });
          NotificationManager.error(
            <IntlMessages id="trading.placeorder.error.properdata" />
          );
        }
      }

    }
  };

  doBuyOrder = event => {
    event.preventDefault();
    const info = this.props.info;

    if (this.state.priceBuy == '' || typeof this.state.priceBuy === undefined || this.state.priceBuy == 0) {

      this.setState({ showLoader: false, buyLimitOrderBit: 0 });
      NotificationManager.error(<IntlMessages id="error.trading.transaction.4607" />);
    } else if (this.state.amountBuy == '' || typeof this.state.amountBuy === undefined || this.state.amountBuy == 0) {

      this.setState({ showLoader: false, buyLimitOrderBit: 0 });
      NotificationManager.error(<IntlMessages id="error.trading.transaction.4608" />);
    } else if (this.state.totalBuy == '' || typeof this.state.totalBuy === undefined || this.state.totalBuy == 0) {
      this.setState({ showLoader: false, buyLimitOrderBit: 0 });
      NotificationManager.error(<IntlMessages id="error.trading.transaction.4609" />);
    } else if (info.currencyPairID == '' || typeof info.currencyPairID === undefined || info.currencyPairID == 0) {

      this.setState({ showLoader: false, buyLimitOrderBit: 0 });
      NotificationManager.error(<IntlMessages id="error.trading.transaction.4601" />);
    } else if (this.props.secondCurrencyWalletId == '' || typeof this.props.secondCurrencyWalletId === undefined || this.props.secondCurrencyWalletId == 0) {

      this.setState({ showLoader: false, buyLimitOrderBit: 0 });
      NotificationManager.error(<IntlMessages id="error.trading.creditwallet" />);
    } else if (this.props.firstCurrencyWalletId == '' || typeof this.props.firstCurrencyWalletId === undefined || this.props.firstCurrencyWalletId == 0) {

      this.setState({ showLoader: false, buyLimitOrderBit: 0 });
      NotificationManager.error(<IntlMessages id="error.trading.debitwallet" />);
    } else {
      const data = {
        currencyPairID: info.currencyPairID,
        debitWalletID: this.props.secondCurrencyWalletId,
        creditWalletID: this.props.firstCurrencyWalletId,
        feePer: 0,
        fee: 0,
        trnMode: 21,
        price: this.state.priceBuy,
        amount: this.state.amountBuy,
        total: this.state.totalBuy,
        ordertype: 1,
        orderSide: 4,
        StopPrice: 0,
        Pair: this.props.firstCurrency + '_' + this.props.secondCurrency,
        marginOrder: this.props.marginTrading
      };

      const { isValid, errors } = validateBuyData(data);
      if (!isValid) {
        if (errors.buyPrice) {
          this.setState({
            isPriceBuyValid: false,
            priceBuyError: errors.buyPrice,
            total: ""
          });
        }

        if (errors.buyAmount) {
          this.setState({
            isAmountBuyValid: false,
            amountBuyError: errors.buyAmount,
            totalBuy: ""
          });
        }

        if (errors.buyTotal) {
          this.setState({
            isTotalBuyValid: false,
            totalBuyError: errors.buyTotal
          });
        }
      } else {
        if (
          this.state.isAmountBuyValid &&
          this.state.isPriceBuyValid &&
          this.state.isTotalBuyValid
        ) {

          this.setState({
            buyLimitOrderBit: 1,
            sellLimitOrderBit: 0
          })

          if (this.state.totalBuy <= this.props.secondCurrencyBalance) {
            this.props.doBuyOrder(data);
          } else {

            this.setState({ showLoader: false, buyLimitOrderBit: 0 });
            NotificationManager.error(
              <IntlMessages id="trading.placeorder.error.minBalance" />
            );
          }
        } else {

          this.setState({ showLoader: false, buyLimitOrderBit: 0 });
          NotificationManager.error(
            <IntlMessages id="trading.placeorder.error.properdata" />
          );
        }
      }

    }
  };

  render() {
   
    const data = this.props.info;
    return (
      <div className="col-sm-12 p-0 d-flex">
        {/* this.props.loading && <JbsSectionLoader /> */}
        <div className="col-sm-6 mb-0 comminborderright">
          <div className="col-sm-12 p-10 m-0">
            <div className="p-0 d-flex justify-content-between">
              <h4 className="mb-5">
                {<IntlMessages id="trading.placeorder.label.buy" />}{" "}
                {data.firstCurrency}
              </h4>
              <p className="fs-14 mb-0">
              {this.props.marginTrading ? <AddMarginBalance
                {...this.props}
                widgetType={3}
                walletTypeName={data.secondCurrency}
                CurrencyBalance={this.props.secondCurrencyBalance ?
                  parseFloat(this.props.secondCurrencyBalance).toFixed(8)
                  : parseFloat(0).toFixed(8)
                } /> : <a href="javascript:void(0)">
                  <i className="zmdi zmdi-balance-wallet">
                    {" "}
                    {this.props.secondCurrencyBalance ? parseFloat(this.props.secondCurrencyBalance).toFixed(8) : parseFloat(0).toFixed(8)
                    } <span>{data.secondCurrency}</span>
                  </i>
                </a>}
              </p>
            </div>
            <div className="mt-5 mb-5">
              <Form>
                <FormGroup row className="mb-5">
                  <Label sm={4} for="Price">
                    {<IntlMessages id="trading.placeorder.limit.label.price" />}
                  </Label>
                  <Col sm={8}>
                    <Input
                      type="text"
                      name="price"
                      id="price"
                      placeholder={data.secondCurrency}
                      value={this.state.priceBuy}
                      onChange={this.validateBuyPrice}
                      className={!this.state.isPriceBuyValid ? "error" : ""}
                    />
                    {!this.state.isPriceBuyValid && (
                      <div>
                        <span className="text-danger">
                          <IntlMessages id={this.state.priceBuyError} />
                        </span>
                      </div>
                    )}
                  </Col>
                </FormGroup>

                <FormGroup row className="mb-5">
                  <Label sm={4} for="Amount">
                    {<IntlMessages id="trading.placeorder.label.amount" />}
                  </Label>
                  <Col sm={8}>
                    <Input
                      type="text"
                      disabled={
                        this.state.selectedBuyValue !== 0 ? true : false
                      }
                      name="amount"
                      id="amount"
                      placeholder={data.firstCurrency}
                      value={this.state.amountBuy}
                      onChange={this.validateBuyAmount}
                      className={!this.state.isAmountBuyValid ? "error" : ""}
                    />
                    {!this.state.isAmountBuyValid && (
                      <div>
                        <span className="text-danger">
                          <IntlMessages id={this.state.amountBuyError} />
                        </span>
                      </div>
                    )}
                  </Col>
                </FormGroup>

                <FormGroup row className="mb-5">

                  <Col sm={{size:'8', offset:'4'}}>
                    <Row className="pl-5 pr-5">
                      <Col sm={3} className="m-0 p-0">
                        <Button
                          value="25"
                          className={classnames(
                            { active: this.state.selectedBuyValue === 25 },
                            "orderbtnbuy-percentage btn-xs m-2"
                          )}
                          onClick={event => {
                            this.changeSelectedBuyValue(25);
                          }}
                        >
                          25%
                        </Button>
                      </Col>

                      <Col sm={3} className="m-0 p-0">
                        <Button
                          value="50"
                          className={classnames(
                            { active: this.state.selectedBuyValue === 50 },
                            "orderbtnbuy-percentage btn-xs m-2"
                          )}
                          onClick={event => {
                            this.changeSelectedBuyValue(50);
                          }}
                        >
                          50%
                    </Button>
                      </Col>

                      <Col sm={3} className="m-0 p-0">
                        <Button
                          value="75"
                          className={classnames(
                            { active: this.state.selectedBuyValue === 75 },
                            "orderbtnbuy-percentage btn-xs m-2"
                          )}
                          onClick={event => {
                            this.changeSelectedBuyValue(75);
                          }}
                        >
                          75%
                    </Button>
                      </Col>

                      <Col sm={3} className="m-0 p-0">
                        <Button
                          value="100"
                          className={classnames(
                            { active: this.state.selectedBuyValue === 100 },
                            "orderbtnbuy-percentage btn-xs m-2"
                          )}
                          onClick={event => {
                            this.changeSelectedBuyValue(100);
                          }}
                        >
                          100%
                    </Button>
                      </Col>
                    </Row>
                  </Col>
                </FormGroup>

                <FormGroup row className="mb-5">
                  <Label sm={4} for="Total">
                    {<IntlMessages id="trading.placeorder.label.total" />}
                  </Label>
                  <Col sm={8}>
                    <Input
                      type="text"
                      value={this.state.totalBuy}
                      name="total"
                      id="total"
                      onChange={this.validateBuyTotal}
                      placeholder={data.secondCurrency}
                      className={!this.state.isTotalBuyValid ? "error" : ""}
                    />

                    {!this.state.isTotalBuyValid && (
                      <div>
                        <span className="text-danger">
                          <IntlMessages id={this.state.totalBuyError} />
                        </span>
                      </div>
                    )}
                   
                  </Col>
                </FormGroup>

                <FormGroup className="mt-10 mb-5">
                  <Row>
                    <Col sm={12}>                  
                      <Button 
                      type="submit"
                      name={
                        <IntlMessages id="trading.placeorder.button.buy" />
                      }
                      onClick={event => {
                        this.doBuyOrder(event);
                      }}
                      className="btn btn-outline-success btnbuy-success">
                        {<IntlMessages id="trading.placeorder.button.buy" />} {" "}
                        {data.firstCurrency}
                        {this.props.buyOrderLoading && <CircularProgress size={18} style={{top:'5px',position:'absolute',right:'25px',color:"white"}} />}
                      </Button> 
                      
                    </Col>
                  </Row>
                </FormGroup>
              </Form>
            </div>
          </div>
        </div>
        <div className="col-sm-6 mb-0">
          <div className="col-sm-12 p-10 m-0">
            <div className="p-0 d-flex justify-content-between">
              <h4 className="mb-5">
                {<IntlMessages id="trading.placeorder.label.sell" />}{" "}
                {data.firstCurrency}
              </h4>
              <p className="fs-14 mb-0">
              {this.props.marginTrading ? <AddMarginBalance
                {...this.props}
                widgetType={3}
                walletTypeName={data.firstCurrency}
                CurrencyBalance={this.props.firstCurrencyBalance ?
                  parseFloat(this.props.firstCurrencyBalance).toFixed(8)
                  : parseFloat(0).toFixed(8)
                } /> :
                <a href="javascript:void(0)">
                  <i className="zmdi zmdi-balance-wallet">
                    {" "}
                    {this.props.firstCurrencyBalance ? parseFloat(this.props.firstCurrencyBalance).toFixed(8) : parseFloat(0).toFixed(8)
                    } <span>{data.firstCurrency}</span>
                  </i>
                </a>}
              </p>
            </div>
            <div className="mt-5 mb-5">
              <Form>
                <FormGroup row className="mb-5">
                  <Label sm={4} for="Price">
                    {<IntlMessages id="trading.placeorder.limit.label.price" />}
                  </Label>
                  <Col sm={8}>
                    <Input
                      type="text"
                      name="price"
                      id="price"
                      placeholder={data.secondCurrency}                      
                      value={this.state.priceSell}
                      onChange={this.validateSellPrice}
                      className={!this.state.isPriceSellValid ? "error" : ""}
                    />
                    {!this.state.isPriceSellValid && (
                      <div>
                        <span className="text-danger">
                          <IntlMessages id={this.state.priceSellError} />
                        </span>
                      </div>
                    )}
                  </Col>
                </FormGroup>

                <FormGroup row className="mb-5">
                  <Label sm={4} for="Amount">
                    {<IntlMessages id="trading.placeorder.label.amount" />}
                  </Label>
                  <Col sm={8}>
                    <Input
                      type="text"
                      disabled={
                        this.state.selectedSellValue !== 0 ? true : false
                      }
                      name="amount"
                      id="amount"
                      placeholder={data.firstCurrency}
                      value={this.state.amountSell}
                      onChange={this.validateSellAmount}
                      className={!this.state.isAmountSellValid ? "error" : ""}
                    />
                    {!this.state.isAmountSellValid && (
                      <div>
                        <span className="text-danger">
                          <IntlMessages id={this.state.amountSellError} />
                        </span>
                      </div>
                    )}
                  </Col>
                </FormGroup>

                <FormGroup row className="mb-5">

                  <Col sm={{size:'8', offset:'4'}}>
                    <Row className="pl-5 pr-5">
                      <Col sm={3} className="m-0 p-0">
                        <Button
                          value="25"
                          className={classnames(
                            { active: this.state.selectedSellValue === 25 },
                            "orderbtnsell-percentage btn-xs m-2"
                          )}
                          onClick={event => {
                            this.changeSelectedSellValue(25);
                          }}
                        >
                          25%
                    </Button>
                      </Col>

                      <Col sm={3} className="m-0 p-0">
                        <Button
                          value="50"
                          className={classnames(
                            { active: this.state.selectedSellValue === 50 },
                            "orderbtnsell-percentage btn-xs m-2"
                          )}
                          onClick={event => {
                            this.changeSelectedSellValue(50);
                          }}
                        >
                          50%
                    </Button>
                      </Col>

                      <Col sm={3} className="m-0 p-0">
                        <Button
                          value="75"
                          className={classnames(
                            { active: this.state.selectedSellValue === 75 },
                            "orderbtnsell-percentage btn-xs m-2"
                          )}
                          onClick={event => {
                            this.changeSelectedSellValue(75);
                          }}
                        >
                          75%
                    </Button>
                      </Col>
                      <Col sm={3} className="m-0 p-0">
                        <Button
                          value="100"
                          className={classnames(
                            { active: this.state.selectedSellValue === 100 },
                            "orderbtnsell-percentage btn-xs m-2"
                          )}
                          onClick={event => {
                            this.changeSelectedSellValue(100);
                          }}
                        >
                          100%
                    </Button>
                      </Col>
                    </Row>
                  </Col>
                </FormGroup>

                <FormGroup row className="mb-5">
                  <Label sm={4} for="Total">
                    {<IntlMessages id="trading.placeorder.label.total" />}
                  </Label>
                  <Col sm={8}>
                    <Input
                      type="text"
                      value={this.state.totalSell}
                      // onBlur={this.validateSellTotal}
                      name="total"
                      id="total"
                      onChange={this.validateSellTotal}
                      placeholder={data.secondCurrency}
                      className={!this.state.isTotalSellValid ? "error" : ""}
                    />

                    {!this.state.isTotalSellValid && (
                      <div>
                        <span className="text-danger">
                          <IntlMessages id={this.state.totalSellError} />
                        </span>
                      </div>
                    )}
                 
                  </Col>
                </FormGroup>

                <FormGroup className="mt-10 mb-5">
                  <Row>
                    <Col sm={12}>
                      <Button
                      type="submit"
                        name={
                          <IntlMessages id="trading.placeorder.button.sell" />
                        }
                        onClick={event => {
                          this.doSellOrder(event);
                        }}
                        className="btn btn-outline-danger btnsell-danger"
                      >
                        {<IntlMessages id="trading.placeorder.button.sell" />}{" "}
                        {data.firstCurrency}
                        {this.props.sellOrderLoading && <CircularProgress size={18} style={{top:'5px',position:'absolute',right:'25px',color:"white"}}/>}
                      </Button>
                    </Col>
                  </Row>
                </FormGroup>
              </Form>
            </div>
          </div>
        </div>
        
      </div>
    );
  }
}

// Set Props when actions are dispatch
const mapStateToProps = state => ({
  buyOrder: state.placeOrder.buyOrder,
  sellOrder: state.placeOrder.sellOrder,
  loading: state.placeOrder.loading,
  buyOrderLoading: state.placeOrder.buyOrderLoading,
  sellOrderLoading: state.placeOrder.sellOrderLoading,
  error: state.placeOrder.error,
  //currentPrice:state.currency.currentPrice,  
  currentPrice: state.currentMarketCap.currentMarketCap,
  lastPriceBit: state.currentMarketCap.lastPriceBit,
});

// connect action with store for dispatch
export default connect(
  mapStateToProps,
  {
    doBuyOrder,
    doSellOrder,
    updateBalance
  }
)(LimitOrder);
