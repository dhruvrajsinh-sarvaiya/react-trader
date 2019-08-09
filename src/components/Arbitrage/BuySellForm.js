
/**
 * Author : Tejas
 * Created : 4/06/2019
 *  Arbitrage Buy/Sell Form component..
*/

// import For Component
import React, { Component } from "react";

// used for connect store
import { connect } from "react-redux";

// used for design
import { Form, FormGroup, Label, Input, Button } from "reactstrap";

// used for convert messages in different langauages
import IntlMessages from "Util/IntlMessages";

// used for display notifications
import { NotificationManager } from "react-notifications";

import classnames from "classnames";

// used for validation
import {
  validateQty,
  validatePrice,
  validateTotal,
  validateData,
  validateOnlyNumeric,

} from 'Validations/Arbitrage/buy_sell_form';

// import actions
import {
  getMarketCapList
} from 'Actions/Trade';

// import actions
import {
  arbitragePlaceOrder,
  arbitragePlaceBulkOrder
} from "Actions/Arbitrage";

// Used To Display Progressbar on Buy/Sell Button
import CircularProgress from '@material-ui/core/CircularProgress';

import Slider from 'react-rangeslider'

//class for buy sell form
class BuySellForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formType: 1,
      errors: {},
      isQuantityValid: true,
      isRateValid: true,
      isTotalValid: true,
      quantityError: "",
      rateError: "",
      totalError: "",
      rate: 0,//(this.props.currentPrice.LastPrice) ? parseFloat(this.props.currentPrice.LastPrice).toFixed(this.props.priceLength) : parseFloat(0).toFixed(this.props.priceLength),
      calculateRate : (this.props.currentPrice.LastPrice) ? parseFloat(this.props.currentPrice.LastPrice).toFixed(this.props.priceLength) : parseFloat(0).toFixed(this.props.priceLength),
      quantity: "",      
      total: "",
      orderType: 1,
      bulkOrders: [],
      lastPriceBit: 0,
      placeOrderBit: 0,
      currentRate: "",
      selectedPer: 0,
      updateRate:0,
      orderTypes: [
        { Value: 1, Type: "Limit" },
        { Value: 2, Type: "Market" },
        { Value: 3, Type: "Stop-Limit" },
        { Value: 4, Type: "Spot" }
      ],

      bulkOrderData: [],
      isBulkOrder: false,
      oldRate:0,   
      lpType: 0,
      minNotional:0,
      maxNotional:0,
      minPrice:0,
      maxPrice:0,
      minQty:0,
      maxQty:0,
      socketBuyData: [],
			socketSellData: [],
    };
  }

  componentDidMount() {

    this.props.getMarketCapList({ Pair: this.props.currencyPair });
  }

  UpdateBuyerSellerBook = (OrderBook,socketData,updateBit) => {
		
    this.setState({bulkOrderData : OrderBook, socketBuyData: socketData });
  
/* 	if(updateBit === 1) { // means update for Buy process
    this.setState({ buyerOrder: OrderBook, socketBuyData: socketData });
  } else {
    this.setState({ sellerOrder: OrderBook, socketSellData: socketData });
  } */
  
}

 // code changed by devang parekh 22-2-2019
	// code for normal trading of binding buy/sell orders records
	processForNormalTrading() {

		// code added and change by devang parekh for handling Signalr listners
		this.isComponentActive = 1;

		// ========== process for buyer book order updation from signalr ===========
		// RecieveBuyerBook and store into state and update
		this.props.hubConnection.on('RecieveBuyerBookArbitrage', (receivedMessage) => {

      var buyerData=this.state.bulkOrderData;
			//console.log("RecieveBuyerBookArbitrage", receivedMessage)
			if (this.isComponentActive === 1 && receivedMessage !== null &&  this.state.updateRate == 0) {
				try {
					const receivedMessageData = JSON.parse(receivedMessage);

					if ((receivedMessageData.EventTime && this.state.socketBuyData.length === 0) ||
						(this.state.socketBuyData.length !== 0 && receivedMessageData.EventTime >= this.state.socketBuyData.EventTime)) {

						if (this.props.currencyPair === receivedMessageData.Parameter && typeof receivedMessageData.IsMargin !== 'undefined' && receivedMessageData.IsMargin === 0) {
							const newData = receivedMessageData.Data;

							if (parseFloat(newData.LTP) !== 0 && this.state.bulkOrderData &&  this.state.bulkOrderData.length ==  1) {
                
								//var latestBuyOrders = $.extend(true, [], this.state.buyerOrder);
								//latestBuyOrders.forEach(function (buyOrder, index) { latestBuyOrders[index].UpDownBit = 0 });
								var findIndexPrice = this.state.bulkOrderData.findIndex(buyerOrder => parseFloat(buyerOrder.LpType) === parseFloat(newData.LPType));

								if (findIndexPrice !== -1) {// && this.LPBuyerBook[findIndexPrice].LTP !== newData.LTP) {
									buyerData[findIndexPrice].OldLTP = buyerData[findIndexPrice].rate;
                  buyerData[findIndexPrice].rate = newData.LTP;
                  buyerData[findIndexPrice].total = newData.LTP * buyerData[findIndexPrice].quantity;

                  this.setState({bulkOrderData : buyerData, socketBuyData: receivedMessageData,oldRate:parseFloat(newData.LTP).toFixed(this.props.priceLength),rate: parseFloat(newData.LTP).toFixed(this.props.priceLength),total:parseFloat(newData.LTP * buyerData[findIndexPrice].quantity).toFixed(this.props.amtLength)});
                 
									//this.UpdateBuyerSellerBook(buyerData,receivedMessageData,1); // pass 1 for update buyer book
									//this.setState({ buyerOrder: latestBuyOrders, socketBuyData: receivedMessageData });
								}

							}

						}
					}

				} catch (error) {
					// console.log(error);
				}
			}
		});

		// ====================== end code ================================

		// ============== start code for recieve seller book from signalr ===============
		// get seller book on transaction update and store into state
		this.props.hubConnection.on('RecieveSellerBookArbitrage', (receivedMessage) => {

      var sellerData=this.state.bulkOrderData;
			//console.log("RecieveSellerBookArbitrage", receivedMessage)
			if (this.isComponentActive === 1 && receivedMessage !== null &&  this.state.updateRate == 0) {

				try {

					const receivedMessageData = JSON.parse(receivedMessage);
					if ((receivedMessageData.EventTime && this.state.socketSellData.length === 0) ||
						(this.state.socketSellData.length !== 0 && receivedMessageData.EventTime >= this.state.socketSellData.EventTime)) {

						if (this.props.currencyPair === receivedMessageData.Parameter && typeof receivedMessageData.IsMargin !== 'undefined' && receivedMessageData.IsMargin === 0) {

							const newData = receivedMessageData.Data;				
              
              if (parseFloat(newData.LTP) !== 0 && this.state.bulkOrderData &&  this.state.bulkOrderData.length == 1 ) {
                
								//var latestBuyOrders = $.extend(true, [], this.state.buyerOrder);
								//latestBuyOrders.forEach(function (buyOrder, index) { latestBuyOrders[index].UpDownBit = 0 });
								var findIndexPrice = this.state.bulkOrderData.findIndex(buyerOrder => parseFloat(buyerOrder.LpType) === parseFloat(newData.LPType));

								if (findIndexPrice !== -1) {// && this.LPBuyerBook[findIndexPrice].LTP !== newData.LTP) {
									sellerData[findIndexPrice].OldLTP = sellerData[findIndexPrice].rate;
                  sellerData[findIndexPrice].rate = newData.LTP;
                  sellerData[findIndexPrice].total = newData.LTP * sellerData[findIndexPrice].quantity;

                  this.setState({bulkOrderData : sellerData, socketBuyData: receivedMessageData,oldRate:parseFloat(newData.LTP).toFixed(this.props.priceLength),rate: parseFloat(newData.LTP).toFixed(this.props.priceLength),total:parseFloat(newData.LTP * sellerData[findIndexPrice].quantity).toFixed(this.props.amtLength)});
                 
									//this.UpdateBuyerSellerBook(buyerData,receivedMessageData,1); // pass 1 for update buyer book
									//this.setState({ buyerOrder: latestBuyOrders, socketBuyData: receivedMessageData });
								}

							}

						}

					}

				} catch (error) {
					//console.log("sell section error",error)
				}

			}

		});

		// ================ end code for seller order book process ==============================
  }
  
  componentWillMount(){
    this.processForNormalTrading();
  }

  componentWillUnmount() {
		this.isComponentActive = 0;
  }
  
  // handle change of formtype
  changeFormType = (formType) => {
    this.setState({ formType: formType });
  }

  // involke when component is about to get new props
  componentWillReceiveProps(nextprops) {

    // set lastprice 
   /* if (nextprops.currentPrice && nextprops.currentPrice.LastPrice && this.state.lastPriceBit !== nextprops.lastPriceBit) {

      this.setState({
        rate: parseFloat(nextprops.currentPrice.LastPrice).toFixed(this.props.priceLength),
        currentRate: parseFloat(nextprops.currentPrice.LastPrice).toFixed(this.props.priceLength),
        calculateRate : parseFloat(nextprops.currentPrice.LastPrice).toFixed(this.props.priceLength),
        lastPriceBit: nextprops.lastPriceBit,
        quantity: "",
        selectedPer:0
      })

    } */

    // set bulkbuy order data when set multiple daat   
    if (nextprops.isBulkBuyOrder && nextprops.bulkBuyOrder && nextprops.bulkBuyOrder.length) {

      var averageRate = 0, averageTotal = 0, total = 0, amount = 0, lpType = 0,
       minNotional = 0,
      maxNotional = 0,
      minPrice = 0,
      maxPrice = 0,
      minQty = 0,
      maxQty = 0

      if (nextprops.bulkBuyOrder.bulkPercentage === true) {
        nextprops.bulkBuyOrder.map((order, item) => {

          if(nextprops.bulkBuyOrder.length == 1){
            
            this.setState({
              calculateRate:parseFloat(order.rate).toFixed(this.props.priceLength),
              updateRate:0,
              oldRate:parseFloat(order.rate).toFixed(this.props.priceLength)
            })
            
          }

          averageTotal = parseFloat(averageTotal) + parseFloat(order.rate);

          total = total + parseFloat(order.total);
          amount = amount + parseFloat(order.quantity);
          //return null
        })
        
        averageRate = (averageTotal / nextprops.bulkBuyOrder.length)

        this.setState({
          rate: parseFloat(averageRate).toFixed(this.props.priceLength),
          formType: nextprops.bulkBuyOrder.formType,
          isBulkOrder: true,//nextprops.isBulkBuyOrder,
          selectedPer:0,
          bulkOrderData: nextprops.bulkBuyOrder,
          total: parseFloat(total).toFixed(this.props.amtLength),
          quantity: parseFloat(amount).toFixed(this.props.qtyLength),
          lpType: nextprops.bulkBuyOrder.LpType,
          minNotional : nextprops.bulkBuyOrder.MinNotional,
          maxNotional : nextprops.bulkBuyOrder.MaxNotional,
          minPrice : nextprops.bulkBuyOrder.MinPrice,
          maxPrice : nextprops.bulkBuyOrder.MaxPrice,
          minQty : nextprops.bulkBuyOrder.MinQty,
          maxQty : nextprops.bulkBuyOrder.MaxQty
        })

      } else {
        nextprops.bulkBuyOrder.map((order, item) => {

          averageTotal = averageTotal + order.rate
          total = total + parseFloat(order.total);
          amount = amount + parseFloat(order.quantity);
          lpType = order.LpType
          minNotional = order.MinNotional
          maxNotional = order.MaxNotional
          minPrice = order.MinPrice
          maxPrice =  order.MaxPrice
          minQty = order.MinQty
          maxQty =  order.MaxQty
         // return null
        })

        averageRate = (averageTotal / nextprops.bulkBuyOrder.length)

        this.setState({
          rate: parseFloat(averageRate).toFixed(this.props.priceLength),
          formType: nextprops.bulkBuyOrder.formType,
          isBulkOrder: true,// nextprops.isBulkBuyOrder,
          selectedPer:0,
          bulkOrderData: nextprops.bulkBuyOrder,
          total: parseFloat(total).toFixed(this.props.amtLength),
          quantity: parseFloat(amount).toFixed(this.props.qtyLength),
          lpType: lpType,
          minNotional: minNotional,
          maxNotional: maxNotional,
          minPrice: minPrice,
          maxPrice: maxPrice,
          minQty: minQty,
          maxQty: maxQty,
        })
      }

    } else if (nextprops.bulkBuyOrder && nextprops.bulkBuyOrder.rate !== '-' &&
      nextprops.bulkBuyOrder.rate) {

      // set bulkbuy order data when set single daat    
      if (nextprops.bulkBuyOrder.rate !== this.props.bulkBuyOrder.rate

      ) {

        this.setState({
          rate: parseFloat(nextprops.bulkBuyOrder.rate).toFixed(this.props.priceLength),
          calculateRate : parseFloat(nextprops.bulkBuyOrder.rate).toFixed(this.props.priceLength),
          quantity: "",//parseFloat(nextprops.bulkBuyOrder.quantity).toFixed(8),
          total: "",//nextprops.bulkBuyOrder.total,
          formType: nextprops.bulkBuyOrder.formType,
          isBulkOrder: false,
          selectedPer:0,
          bulkOrderData: [],
          lpType: nextprops.bulkBuyOrder.LpType,
          minNotional : nextprops.bulkBuyOrder.MinNotional,
          maxNotional : nextprops.bulkBuyOrder.MaxNotional,
          minPrice : nextprops.bulkBuyOrder.MinPrice,
          maxPrice : nextprops.bulkBuyOrder.MaxPrice,
          minQty : nextprops.bulkBuyOrder.MinQty,
          maxQty : nextprops.bulkBuyOrder.MaxQty
        })
      }
    }


    // set bulksell order data when set multiple daat    
    if (nextprops.isBulkSellOrder && nextprops.bulkSellOrder && nextprops.bulkSellOrder.length) {

      var averageRate = 0, averageTotal = 0, total = 0, amount = 0, lpType = 0,
      minNotional = 0,
      maxNotional = 0,
      minPrice = 0,
      maxPrice = 0,
      minQty = 0,
      maxQty = 0
      
      if (nextprops.bulkSellOrder.bulkPercentage === true) {
        nextprops.bulkSellOrder.map((order, item) => {

          if(nextprops.bulkSellOrder.length == 1){
            
            this.setState({
              calculateRate:parseFloat(order.rate).toFixed(this.props.priceLength),
              updateRate:0,
              oldRate:parseFloat(order.rate).toFixed(this.props.priceLength)
            })
            
          }

          averageTotal = parseFloat(averageTotal) + parseFloat(order.rate);
          total = total + parseFloat(order.total);
          amount = amount + parseFloat(order.quantity);
          //return null
        })

      

        averageRate = (averageTotal / nextprops.bulkSellOrder.length)

        this.setState({
          rate: parseFloat(averageRate).toFixed(this.props.priceLength),
          formType: nextprops.bulkSellOrder.formType,
          isBulkOrder: true,//nextprops.isBulkSellOrder,
          selectedPer:0,
          bulkOrderData: nextprops.bulkSellOrder,
          total: parseFloat(amount * averageRate).toFixed(this.props.amtLength),
          quantity: parseFloat(amount).toFixed(this.props.qtyLength),
          lpType: nextprops.bulkSellOrder.LpType,
          minNotional : nextprops.bulkSellOrder.MinNotional,
          maxNotional : nextprops.bulkSellOrder.MaxNotional,
          minPrice : nextprops.bulkSellOrder.MinPrice,
          maxPrice : nextprops.bulkSellOrder.MaxPrice,
          minQty : nextprops.bulkSellOrder.MinQty,
          maxQty : nextprops.bulkSellOrder.MaxQty
        })

      } else {

        nextprops.bulkSellOrder.map((order, item) => {

          averageTotal = averageTotal + order.rate;
          total = total + parseFloat(order.total);
          amount = amount + parseFloat(order.quantity);
          lpType = order.LpType
          minNotional = order.MinNotional
          maxNotional = order.MaxNotional
          minPrice = order.MinPrice
          maxPrice =  order.MaxPrice
          minQty = order.MinQty
          maxQty =  order.MaxQty
          //return null
        })

        averageRate = (averageTotal / nextprops.bulkSellOrder.length)
        this.setState({
          rate: parseFloat(averageRate).toFixed(this.props.priceLength),
          formType: nextprops.bulkSellOrder.formType,
          isBulkOrder: true,//nextprops.isBulkSellOrder,
          selectedPer:0,
          bulkOrderData: nextprops.bulkSellOrder,
          total: parseFloat(amount * averageRate).toFixed(this.props.amtLength),
          quantity: parseFloat(amount).toFixed(this.props.qtyLength),
          lpType: lpType,
          minNotional: minNotional,
          maxNotional: maxNotional,
          minPrice: minPrice,
          maxPrice: maxPrice,
          minQty: minQty,
          maxQty: maxQty,
          
        })
      }


    } else if (nextprops.bulkSellOrder && nextprops.bulkSellOrder.rate !== '-' &&
      nextprops.bulkSellOrder.rate) {

      // set bulksell order data when set single data    
      if (nextprops.bulkSellOrder.rate !== this.props.bulkSellOrder.rate
      ) {
        this.setState({
          rate: parseFloat(nextprops.bulkSellOrder.rate).toFixed(this.props.priceLength),
          calculateRate : parseFloat(nextprops.bulkSellOrder.rate).toFixed(this.props.priceLength),
          quantity: "",//parseFloat(nextprops.bulkSellOrder.quantity).toFixed(8),
          total: "",//nextprops.bulkSellOrder.total,
          formType: nextprops.bulkSellOrder.formType,
          isBulkOrder: false,
          bulkOrderData: [],
          selectedPer:0,
          lpType: nextprops.bulkSellOrder.LpType,
          minNotional : nextprops.bulkSellOrder.MinNotional,
          maxNotional : nextprops.bulkSellOrder.MaxNotional,
          minPrice : nextprops.bulkSellOrder.MinPrice,
          maxPrice : nextprops.bulkSellOrder.MaxPrice,
          minQty : nextprops.bulkSellOrder.MinQty,
          maxQty : nextprops.bulkSellOrder.MaxQty
        })
      }
    }

     if (nextprops.isBothOrder) {  
            
      this.setState({
        rate: 0,//this.state.currentRate,
        quantity: "",
        total: "",
        formType: this.state.formType,
        lpType: "",
        bulkOrderData: [],
        isBulkOrder: false,
        updateRate:0,
        selectedPer:0,
      })
    }
    // set response for buyer data
    if (nextprops.buyOrder && nextprops.error.length === 0) {

      if (this.state.placeOrderBit) {

        if (nextprops.buyOrder.statusCode === 200 && nextprops.buyOrder.ErrorCode === 4566) {
          NotificationManager.success(<IntlMessages id={`trading.orders.orders.trnid`} values={nextprops.buyOrder.response} />);

        } else if (nextprops.buyOrder.statusCode === 200 && nextprops.buyOrder.ErrorCode === 4568) {

          NotificationManager.error(<IntlMessages id="error.trading.transaction.4568" />)
        }
        this.setState({
          buyOrderResponse: nextprops.buyOrder.response,
          sellOrderResponse: [],
          lpType: 0,
          quantity: "",
          total: "",
          modalBuy: true,
          modalSell: false,
          errorLimit: "",
          placeOrderBit: 0,
          isBulkOrder: false,
          bulkOrderData: [],
          updateRate:0
        });

        this.props.ClearAllFields();
      } else {
        this.setState({
          buyOrderResponse: [],
          updateRate:0
        })
      }
    } else if (nextprops.error.ReturnCode !== 0 && this.state.placeOrderBit) {

      NotificationManager.error(<IntlMessages id={`error.trading.transaction.${nextprops.error.ErrorCode}`} />);
      if (nextprops.error.ReturnCode === 9) {

        NotificationManager.error(<IntlMessages id="placeorder.buysell.error.internalerror" />)
      }


      this.setState({
        errorLimit: nextprops.error.ReturnMsg,
        buyOrderResponse: [],
        placeOrderBit: 0,
        isBulkOrder: false,
        bulkOrderData: [],
        lpType: 0,
        quantity: "",
        total: "",
        updateRate:0
      })
    }
  }

  // validate rate with onchange and provide validations
  validateRate = event => {
  
    var calculate = parseFloat((this.state.calculateRate * 10)/100).toFixed(8)  
    var calculatedRateMore = parseFloat(parseFloat(this.state.calculateRate) + parseFloat(calculate)).toFixed(this.props.priceLength) //parseFloat(parseFloat((this.state.calculateRate * 10) / 100) + this.state.calculateRate).toFixed(8);
    var calculatedRateLess = parseFloat(parseFloat(this.state.calculateRate) - parseFloat(calculate)).toFixed(this.props.priceLength) //parseFloat(parseFloat((this.state.calculateRate * 10) / 100) - this.state.calculateRate).toFixed(8);


    if (validateOnlyNumeric(event.target.value)) {      

      let noOfPlaces = event.target.value.includes(".") ? event.target.value.toString().split(".").pop().length : 0; 

      if(noOfPlaces <= this.props.priceLength && event.target.value.toString().split(".").length <=2 ){
        if(parseFloat(event.target.value) < parseFloat(calculatedRateLess)){
  
          this.setState({
            selectedPer : -10,
            updateRate:1
          })
        } else if(parseFloat(event.target.value) > parseFloat(calculatedRateMore)){
  
          this.setState({
            selectedPer : 10,
            updateRate:1
          })
        }else{
          var per  = parseFloat(((event.target.value *100 )/this.state.calculateRate)-100).toFixed(2)
  
          this.setState({
            selectedPer : per,
            updateRate:1
          })
          
        }
  
        this.setState({ rate: event.target.value,updateRate:1});
        const { isValid, errors } = validatePrice(event.target.value);
        if (isValid) {
          this.setState({ isRateValid: true });
  
          if (this.state.quantity !== "" && this.state.isQuantityValid) {
            this.setState({
              total: parseFloat(
                parseFloat(this.state.quantity) * parseFloat(event.target.value)
              ).toFixed(this.props.amtLength),
              isTotalValid: true,
              updateRate:1
            });
  
            if (this.state.isBulkOrder === true) {
              if (this.state.bulkOrderData && this.state.bulkOrderData.length) {
                var data = this.state.bulkOrderData;
                this.state.bulkOrderData.map((order, item) => {
                  data[item].rate = event.target.value
                  data[item].total = parseFloat(
                    parseFloat(event.target.value) * parseFloat(this.state.quantity)
                  ).toFixed(this.props.amtLength)
                  //return null
                })
                this.setState({ bulkOrderData: data,updateRate:1 })
              }
            }
  
          } else {
            this.setState({ total: "", isTotalValid: true,updateRate:1 });
          }
        } else {
          this.setState({
            isRateValid: false,
            rateError: errors.rate,
            total: "",
            updateRate:1
          });
        }  
      }   
     
    }else if (event.target.value === "") {
      // process for blank message
      this.setState({ rate: event.target.value, total: "",updateRate:1 });
    }
  };

  // validate Quantity  with onchange and provide validations
  validateQuantity = event => {

    if (validateOnlyNumeric(event.target.value)) {
      let noOfPlaces = event.target.value.indexOf(".") !== -1 ? event.target.value.toString().split(".").pop().length : 0; 
  
      if(noOfPlaces <= this.props.qtyLength && event.target.value.toString().split(".").length <=2 ){
     
      const { isValid, errors } = validateQty(event.target.value);

      this.setState({ quantity: event.target.value });

      if (isValid) {
        this.setState({ isQuantityValid: true });

        if (this.state.rate !== "" && this.state.isRateValid) {
          this.setState({
            total: parseFloat(
              parseFloat(event.target.value) * parseFloat(this.state.rate)
              ).toFixed(this.props.amtLength),

            isTotalValid: true
          });

          if (this.state.isBulkOrder === true) {
            if (this.state.bulkOrderData && this.state.bulkOrderData.length) {
              var data = this.state.bulkOrderData;
              this.state.bulkOrderData.map((order, item) => {
                data[item].quantity = event.target.value
                data[item].total = parseFloat(
                  parseFloat(event.target.value) * parseFloat(this.state.rate)
                  ).toFixed(this.props.amtLength)
                //return null
              })
              this.setState({ bulkOrderData: data })
            }
          }
        } else {
          this.setState({ total: "", isTotalValid: true });
        }
      } else {
        this.setState({
          isQuantityValid: false,
          quantityError: errors.quantity,
          total: ""
        });
      }
    }
    } else if (event.target.value === "") {
      // process for blank message
      this.setState({
        quantity: event.target.value,
        total: "",
      });
    }
  };

  // validate Total with onchange and provide validations
  validateTotal = event => {

    if (validateOnlyNumeric(event.target.value)) {
      this.setState({ total: event.target.value });

      const { isValid, errors } = validateTotal(event.target.value);
      if (isValid) {
        this.setState({ isTotalValid: true });

        // calculation process of Amount
        if (
          this.state.rate != "" &&
          this.state.isRateValid &&
          this.state.total !== 0
        ) {
          this.setState({
            quantity: parseFloat(
              parseFloat(event.target.value) / parseFloat(this.state.rate)
              ).toFixed(this.props.qtyLength),
            isQuantityValid: true
          });
        } else {
          this.setState({ quantity: "", isQuantityValid: true });
        }
      } else {
        this.setState({
          isTotalValid: false,
          totalError: errors.total
        });
      }
    } else if (event.target.value == "") {
      // process for blank message
      this.setState({ total: event.target.value, quantity: "" });
    }
  };

  onChangeOrderType = (event) => {
    event.preventDefault();

    this.setState({
      orderType: event.target.value
    })
  }

  handleOnChangeSlider = (value) => {
    var calculate = 0
    if(value !== 0 && this.state.calculateRate != 0){
      
      calculate = parseFloat((this.state.calculateRate * value)/100).toFixed(8);

      var rate = parseFloat(parseFloat(this.state.calculateRate) + parseFloat(calculate)).toFixed(this.props.priceLength)

      if (this.state.quantity !== "" && this.state.isQuantityValid) {
        this.setState({
          total: parseFloat(
            parseFloat(this.state.quantity) * parseFloat(rate)
          ).toFixed(this.props.amtLength),
          isTotalValid: true,
          updateRate:1
        });
      } 

      this.setState({
        rate:rate,
        updateRate:1
      })    
      
      if (this.state.isBulkOrder === true) {
        if (this.state.bulkOrderData && this.state.bulkOrderData.length) {
          var data = this.state.bulkOrderData;
          this.state.bulkOrderData.map((order, item) => {
            data[item].rate = rate
            data[item].total = parseFloat(
              parseFloat(rate) * parseFloat(this.state.quantity)
            ).toFixed(this.props.amtLength)
            //return null
          })
          this.setState({ bulkOrderData: data,updateRate:1 })
        }
      }
    }
    

    if (this.state.selectedPer !== value) {
      
        this.setState({
            selectedPer: value,
            updateRate:1
        })
    }

    if(this.state.selectedPer == 0){      
      
      this.setState({
        rate : this.state.oldRate
      })
    }
  }

  // place order 
  placeOrder = (e) => {
    e.preventDefault();
    const info = this.props.info;

    if (this.state.isBulkOrder === true && this.state.bulkOrderData && this.state.bulkOrderData.length) {

      var Total = 0,Amount=0
      this.state.bulkOrderData.map((order, index) => {

        Total = Total + parseFloat(parseFloat(parseFloat(this.state.rate) * parseFloat(order.quantity)).toFixed(this.props.amtLength));
        Amount = Amount + parseFloat(order.quantity);
       // return null
      })

        var MultipleOrderList = [],checked=0;

        this.state.bulkOrderData.map((order, index) => {

          if ((checked === 0) && (order.rate === '' || typeof order.rate === undefined || order.rate === 0 || parseFloat(order.rate) === 0.0)) {

            checked = 1
            this.setState({ placeOrderBit: 0 });            
            NotificationManager.error(<IntlMessages id="error.trading.transaction.4607" />);

          } else if ( (checked === 0) && (order.quantity === '' || typeof order.quantity === undefined || order.quantity === 0 || parseFloat(order.quantity) === 0.0)) {

            checked = 1
            this.setState({ placeOrderBit: 0 });            
            NotificationManager.error(<IntlMessages id="error.trading.transaction.4608" />);

            return true;
          } else if ( (checked === 0) && (order.total === '' || typeof order.total === undefined || order.total === 0 || parseFloat(order.total) === 0.0)) {

            checked = 1
            this.setState({ placeOrderBit: 0 });
            NotificationManager.error(<IntlMessages id="error.trading.transaction.4609" />);

          } else if ( (checked === 0) && (order.LpType === "" || typeof order.LpType === undefined || order.LpType === 0)) {

            checked = 1
            this.setState({ placeOrderBit: 0 });
            NotificationManager.error(<IntlMessages id="sidebar.arbitrageLpType" />);

          } else if ((checked === 0) && (info.currencyPairID === '' || typeof info.currencyPairID === undefined || info.currencyPairID === 0)) {

            checked = 1
            this.setState({ placeOrderBit: 0 });
            NotificationManager.error(<IntlMessages id="error.trading.transaction.4601" />);

          } else if ((checked === 0) && (this.props.secondCurrencyWalletId === '' || typeof this.props.secondCurrencyWalletId === undefined || this.props.secondCurrencyWalletId === 0)) {

            checked = 1
            this.setState({ placeOrderBit: 0 });
            NotificationManager.error(<IntlMessages id="error.trading.creditwallet" />);

          } else if ((checked === 0) && (this.props.firstCurrencyWalletId === '' || typeof this.props.firstCurrencyWalletId === undefined || this.props.firstCurrencyWalletId === 0)) {

            checked = 1
            this.setState({ placeOrderBit: 0 });
            NotificationManager.error(<IntlMessages id="error.trading.debitwallet" />);

          }  else if( (checked === 0) &&  (order.quantity < order.MinQty  ||  order.quantity > order.MaxQty)){

            checked = 1
            this.setState({ placeOrderBit: 0 });
            
            NotificationManager.error(<IntlMessages id={`apiErrorCode.minMaxQty`} values={{param1:order.MinQty,param2:order.MaxQty}} />);          
          }  else if((checked === 0) &&  (order.rate < order.MinPrice  ||  order.rate > order.MaxPrice)){

            checked = 1
            this.setState({ placeOrderBit: 0 });
            
            NotificationManager.error(<IntlMessages id={`apiErrorCode.minMaxPrice`} values={{param1:order.MinPrice,param2:order.MaxPrice}} />);          
          }  else if( (checked === 0) &&  (order.total < order.MinNotional  ||  order.total > order.MaxNotional)){

            checked = 1
            this.setState({ placeOrderBit: 0 });
            
            NotificationManager.error(<IntlMessages id={`apiErrorCode.minMaxTotal`} values={{param1:order.MinNotional,param2:order.MaxNotional}} />);
          } else {

            if(checked === 0 ){
            const data = {
              currencyPairID: info.currencyPairID,
              debitWalletID: this.state.formType === 1 ?
                this.props.secondCurrencyWalletId :
                this.state.formType === 2 &&
                this.props.firstCurrencyWalletId,

              creditWalletID: this.state.formType === 1 ?
                this.props.firstCurrencyWalletId :
                this.state.formType === 2 &&
                this.props.secondCurrencyWalletId,

              feePer: 0,
              fee: 0,
              trnMode: 11,
               price: parseFloat(order.rate).toFixed(this.props.priceLength),
              amount: parseFloat(order.quantity).toFixed(this.props.qtyLength),
              total: parseFloat(order.total).toFixed(this.props.amtLength),
              ordertype: 1,
              orderSide: this.state.formType === 1 ? 4 :
                this.state.formType === 2 && 5,
              StopPrice: 0,
              nonce: "55445454",
              Pair: this.props.firstCurrency + '_' + this.props.secondCurrency,
              marginOrder: this.props.marginTrading,
              RouteID: 1,
              LPType: order.LpType
            }

            MultipleOrderList.push(data)
          }
        }
          //return null
        })

        if(this.state.bulkOrderData && this.state.bulkOrderData.length && this.state.bulkOrderData.length == 1){

          
          var calculate = parseFloat((this.state.calculateRate * 10)/100).toFixed(8)  
          var calculatedRateMore = parseFloat(parseFloat(this.state.calculateRate) + parseFloat(calculate)) //parseFloat(parseFloat((this.state.calculateRate * 10) / 100) + this.state.calculateRate).toFixed(8);
          var calculatedRateLess = parseFloat(parseFloat(this.state.calculateRate) - parseFloat(calculate)) //parseFloat(parseFloat((this.state.calculateRate * 10) / 100) - this.state.calculateRate).toFixed(8);

          this.state.bulkOrderData.map((order,item) => {
          
            if(order.rate !== '' && (order.rate > calculatedRateMore || order.rate < calculatedRateLess)){

              NotificationManager.error(<IntlMessages id={`apiErrorCode.minMaxPrice`} values={{param1:calculatedRateLess,param2:calculatedRateMore}} />);          
            }else{

              if(this.state.formType === 1 && checked === 0){

                if(Total <= this.props.secondCurrencyBalance){
            if (MultipleOrderList && MultipleOrderList.length) {

              const payload = {
                MultipleOrderList: MultipleOrderList,
                Pair: this.props.firstCurrency + '_' + this.props.secondCurrency
              }
    
              this.setState({
                placeOrderBit: 1,
              })
    
              this.props.arbitragePlaceBulkOrder(payload);
            }
          } else{
            this.setState({ placeOrderBit: 0 });
            NotificationManager.error(
              <IntlMessages id="trading.placeorder.error.minBalance" />
            );
          }
        } else if(this.state.formType === 2 && checked === 0){

          if(Amount <= this.props.firstCurrencyBalance){
            if (MultipleOrderList && MultipleOrderList.length) {

              const payload = {
                MultipleOrderList: MultipleOrderList,
                Pair: this.props.firstCurrency + '_' + this.props.secondCurrency
              }
    
              this.setState({
                placeOrderBit: 1,
              })
   
             this.props.arbitragePlaceBulkOrder(payload);
            }
          } else{
            this.setState({ placeOrderBit: 0 });
            NotificationManager.error(
              <IntlMessages id="trading.placeorder.error.minBalance" />
            );
          }
        }  
      }
    })
  } else if(this.state.bulkOrderData && this.state.bulkOrderData.length > 1){
    if(this.state.formType === 1 && checked === 0){

      if(Total <= this.props.secondCurrencyBalance){
        if (MultipleOrderList && MultipleOrderList.length) {

          const payload = {
            MultipleOrderList: MultipleOrderList,
            Pair: this.props.firstCurrency + '_' + this.props.secondCurrency
          }

          this.setState({
            placeOrderBit: 1,
          })

          this.props.arbitragePlaceBulkOrder(payload);
        }
      } else{
        this.setState({ placeOrderBit: 0 });
        NotificationManager.error(
          <IntlMessages id="trading.placeorder.error.minBalance" />
        );
      }
    } else if(this.state.formType === 2 && checked === 0){

      if(Amount <= this.props.firstCurrencyBalance){
        if (MultipleOrderList && MultipleOrderList.length) {

          const payload = {
            MultipleOrderList: MultipleOrderList,
            Pair: this.props.firstCurrency + '_' + this.props.secondCurrency
          }

          this.setState({
            placeOrderBit: 1,
          })

          this.props.arbitragePlaceBulkOrder(payload);
        }
      } else{
        this.setState({ placeOrderBit: 0 });
        NotificationManager.error(
          <IntlMessages id="trading.placeorder.error.minBalance" />
        );
      }
    }   
  }         
            



    } else {
      if (this.state.rate === '' || typeof this.state.rate === undefined || this.state.rate === 0 || parseFloat(this.state.rate) === 0.0 ) {

        this.setState({ placeOrderBit: 0 });
        NotificationManager.error(<IntlMessages id="error.trading.transaction.4607" />);

      } else if (this.state.quantity === '' || typeof this.state.quantity === undefined || this.state.quantity === 0 || parseFloat(this.state.quantity) === 0.0 ) {

        this.setState({ placeOrderBit: 0 });
        NotificationManager.error(<IntlMessages id="error.trading.transaction.4608" />);

      } else if (this.state.total === '' || typeof this.state.total === undefined || this.state.total === 0 || parseFloat(this.state.total) === 0.0 ) {

        this.setState({ placeOrderBit: 0 });
        NotificationManager.error(<IntlMessages id="error.trading.transaction.4609" />);

      } else if (this.state.lpType === '' || typeof this.state.lpType === undefined || this.state.lpType === 0) {

        this.setState({ placeOrderBit: 0 });
        NotificationManager.error(<IntlMessages id="sidebar.arbitrageLpType" />);

      } else if (info.currencyPairID === '' || typeof info.currencyPairID === undefined || info.currencyPairID === 0) {

        this.setState({ placeOrderBit: 0 });
        NotificationManager.error(<IntlMessages id="error.trading.transaction.4601" />);

      } else if (this.props.secondCurrencyWalletId === '' || typeof this.props.secondCurrencyWalletId === undefined || this.props.secondCurrencyWalletId === 0) {

        this.setState({ placeOrderBit: 0 });
        NotificationManager.error(<IntlMessages id="error.trading.creditwallet" />);

      } else if (this.props.firstCurrencyWalletId === '' || typeof this.props.firstCurrencyWalletId === undefined || this.props.firstCurrencyWalletId === 0) {

        this.setState({ placeOrderBit: 0 });
        NotificationManager.error(<IntlMessages id="error.trading.debitwallet" />);

      }  else if( this.state.quantity < this.state.minQty  ||  this.state.quantity > this.state.maxQty){

        checked = 1
        this.setState({ placeOrderBit: 0 });
        // NotificationManager.error(<IntlMessages id="error.trading.debitwallet" />);
        NotificationManager.error(<IntlMessages id={`apiErrorCode.minMaxQty`} values={{param1:this.state.minQty,param2:this.state.maxQty}} />);
      }  else if( this.state.rate < this.state.minPrice  ||  this.state.rate > this.state.maxPrice){

        checked = 1
        this.setState({ placeOrderBit: 0 });
        // NotificationManager.error(<IntlMessages id="error.trading.debitwallet" />);
        NotificationManager.error(<IntlMessages id={`apiErrorCode.minMaxPrice`} values={{param1:this.state.minPrice,param2:this.state.maxPrice}} />);
      }  else if( this.state.total < this.state.minNotional  ||  this.state.total > this.state.maxNotional){

        checked = 1
        this.setState({ placeOrderBit: 0 });
        // NotificationManager.error(<IntlMessages id="error.trading.debitwallet" />);
        NotificationManager.error(<IntlMessages id={`apiErrorCode.minMaxTotal`} values={{param1:this.state.minNotional,param2:this.state.maxNotional}} />);
      } else {

        const data = {
          currencyPairID: info.currencyPairID,
          debitWalletID: this.state.formType === 1 ?
            this.props.secondCurrencyWalletId :
            this.state.formType === 2 &&
            this.props.firstCurrencyWalletId,

          creditWalletID: this.state.formType === 1 ?
            this.props.firstCurrencyWalletId :
            this.state.formType === 2 &&
            this.props.secondCurrencyWalletId,

          feePer: 0,
          fee: 0,
          trnMode: 21,
          price: parseFloat(this.state.rate).toFixed(this.props.priceLength),
          amount: parseFloat(this.state.quantity).toFixed(this.props.qtyLength),
          total: parseFloat(this.state.total).toFixed(this.props.amtLength),
          ordertype: 1,
          orderSide: this.state.formType === 1 ? 4 :
            this.state.formType === 2 && 5,
          StopPrice: 0,
          nonce: "55445454",
          Pair: this.props.firstCurrency + '_' + this.props.secondCurrency,
          marginOrder: this.props.marginTrading,
          RouteID: 1,
          LPType: this.state.lpType
        };



        const { isValid, errors } = validateData(data);

        if (!isValid) {

          if (errors.rate) {
            this.setState({
              isPriceBuyValid: false,
              priceBuyError: errors.rate,
              total: ""
            });
          }

          if (errors.quantity) {
            this.setState({
              isAmountBuyValid: false,
              amountBuyError: errors.quantity,
              totalBuy: ""
            });
          }

          if (errors.total) {
            this.setState({
              isTotalBuyValid: false,
              totalBuyError: errors.total
            });
          }

        } else {

          if (
            this.state.isQuantityValid &&
            this.state.isRateValid &&
            this.state.isTotalValid
          ) {

            this.setState({
              placeOrderBit: 1,
            })

            if(this.state.formType === 1){

                if (this.state.total <= this.props.secondCurrencyBalance) {

                  this.props.arbitragePlaceOrder(data);
                } else {
    
                  this.setState({ placeOrderBit: 0 });
                  NotificationManager.error(
                    <IntlMessages id="trading.placeorder.error.minBalance" />
                  );
                }
            }else if(this.state.formType === 2){

                if (this.state.quantity <= this.props.firstCurrencyBalance) {

                  this.props.arbitragePlaceOrder(data);
                } else {
    
                  this.setState({ placeOrderBit: 0 });
                  NotificationManager.error(
                    <IntlMessages id="trading.placeorder.error.minBalance" />
                  );
                }
            }
            

          } else {

            this.setState({ placeOrderBit: 0 });
            NotificationManager.error(
              <IntlMessages id="trading.placeorder.error.properdata" />
            );
          }
        }

      }
    }
  }

  // Render Component for Buyer Order
  render() {

    const { formType } = this.state;
    return (
      <div className="arb_buy_sell_frm">
          {/* <div className="row m-0 mb-10 tblst">
          <div className={`col-6 buy${formType === 1 ? ' active' : ''}`}>
            <IntlMessages id="trading.placeorder.label.buy" />
          </div>
          <div className={`col-6 sell${formType === 2 ? ' active' : ''}`}>
            <IntlMessages id="trading.placeorder.label.sell" />
          </div>
        </div> */}
        <Form className="tradefrm">
          <FormGroup>
            <Label for="orderType">
              {<IntlMessages id="tradesummary.tradeSummaryColumn.orderType" />}
            </Label>
            <Input disabled={true} type="select" name="orderType" value={this.state.orderType} id="orderType"
              onChange={this.onChangeOrderType}>
              {this.state.orderTypes.map((order, key) =>
                <option key={key} value={order.Value}>{order.Type}</option>
              )}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="quantity">
              {<IntlMessages id="wallet.Qty" />} {" "}
              ({this.props.firstCurrency})
                            </Label>
            <Input
              type="text"
              tabIndex="2"
              name="quantity"
              value={this.state.quantity}
              disabled={this.state.isBulkOrder === true ? false : true}
              id="quantity"
              autoComplete="off"
              onChange={this.validateQuantity}
              className={!this.state.isQuantityValid ? "error text-buybook" : "text-buybook"}
            />
            {!this.state.isQuantityValid && (
              <div>
                <span className="text-danger">
                  <IntlMessages id={this.state.quantityError} />
                </span>
              </div>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="rate">
              {formType === 1 ?
                <IntlMessages id="myaccount.tradeSummaryColumn.buyRate" /> :
                <IntlMessages id="myaccount.tradeSummaryColumn.sellRate" />
              }
            </Label>
            <Input type="text" tabIndex="3" name="rate"
              value={this.state.rate}
              autoComplete="off"
              onFocus={() =>{this.setState({updateRate:1})}}
              id="rate" onChange={this.validateRate}
              disabled={this.state.isBulkOrder === false || (this.state.isBulkOrder === true && this.state.bulkOrderData.length > 1) ? true : false}
              className={!this.state.isRateValid ? "error text-buybook" : "text-buybook"}
            />
            {!this.state.isRateValid && (
              <div>
                <span className="text-danger">
                  <IntlMessages id={this.state.rateError} />
                </span>
              </div>
            )}
          </FormGroup>
          <FormGroup>              
                <div 
                className={this.state.isBulkOrder === false || (this.state.isBulkOrder === true && this.state.bulkOrderData.length > 1) ? "disables_slider arbitrage_slider_box" : "arbitrage_slider_box"}
             /*    className={classnames(
                  (this.state.selectedPer === 0 || this.state.selectedPer <=9 ) && "arbitrage_slider_box_max",
                  this.state.selectedPer < 0 && "arbitrage_slider_box_min",
                  "arbitrage_slider_box")} */
                  >

                  <Slider                
                    value={this.state.selectedPer}
                    orientation="horizontal"
                    onChange={this.handleOnChangeSlider}
                    min={-10}
                    max={10}
                    step={0.25}
                    tooltip={true}
                    handleLabel={parseFloat(this.state.selectedPer).toFixed(2) + "%"}      
                    disabled={(this.state.isBulkOrder === true && this.state.bulkOrderData.length > 1) && true}
                    // labels={ {0: '0', "-1":"-1","-2":"-2","-3":"-3","-4": '-4',"-5": '-5',"-6": '-6',"-7": '-7',"-8": '-8',"-9": '-9',"-10": '-10',
                    // 1:"1",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9",10:"10"}}
                    //handleLabel={String}
                    />    
                </div>
              </FormGroup> 
            <FormGroup>
            <Label for="total">
              {<IntlMessages id="trading.orders.label.total" />}
            </Label>
            <Input
              type="text"
              tabIndex="5"
              name="total"
              value={this.state.total}
              disabled={true}
              id="total"
              onChange={this.validateTotal}
              className={!this.state.isTotalValid ? "error text-buybook" : "text-buybook"}
            />

            {!this.state.isTotalValid && (
              <div>
                <span className="text-danger">
                  <IntlMessages id={this.state.totalError} />
                </span>
              </div>
            )}
          </FormGroup>
          <FormGroup>
            <Button
              tabIndex="6"
              name={formType === 1 ?
                <IntlMessages id="trading.placeorder.button.buy" />
                :
                <IntlMessages id="trading.placeorder.button.sell" />
              }
              className={formType === 1 ? "btn btn-buy arbitrage-btnbuysell" : "btn btn-sell arbitrage-btnbuysell"}
              type="submit"
              onClick={(e) => {
                e.preventDefault(); this.state.lpType === 0 ?
                  NotificationManager.error(<IntlMessages id="sidebar.arbitrageSelectOrder" />) :
                  this.placeOrder(e)
              }
              }>
              {formType === 1 ? <IntlMessages id="trading.placeorder.button.buy" />
                :
                <IntlMessages id="trading.placeorder.button.sell" />
              }

              {" "}
              {this.props.firstCurrency}
              {this.props.loading
                && <CircularProgress size={18}
                  style={{
                    top: '30px',
                    position: 'absolute',
                    right: '20px',
                    color: "white"
                  }}
                />}

            </Button>
          </FormGroup>
        </Form>

        <div className="text-center mt-5">                 
                  <IntlMessages id={`sidebar.arbitrageAverage`} values={{ Param1: this.state.rate }} />
        </div>
      </div>
    );
  }
}

// Set Props when actions are dispatch
const mapStateToProps = state => ({
  buyOrder: state.arbitragePlaceOrder.arbitragePlaceOrder,
  loading: state.arbitragePlaceOrder.placeOrderLoader,
  buyOrderLoading: state.placeOrder.buyOrderLoading,
  sellOrderLoading: state.placeOrder.sellOrderLoading,
  error: state.arbitragePlaceOrder.arbitragePlaceOrderError,
  currentPrice: state.currentMarketCap.currentMarketCap,
  lastPriceBit: state.currentMarketCap.lastPriceBit,
});

// connect action with store for dispatch
export default connect(
  mapStateToProps,
  {
    arbitragePlaceOrder,
    getMarketCapList,
    arbitragePlaceBulkOrder
  }
)(BuySellForm);