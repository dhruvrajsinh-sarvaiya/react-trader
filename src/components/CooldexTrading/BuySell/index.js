// component for Display Sell And Buy Trade  By Tejas Date:13/9/2018

import React from "react";

// import component buy trade
import BuyTrade from "./BuyTrade";

// intl messages
import IntlMessages from "Util/IntlMessages";


// import component Sell trade
import SellTrade from "./SellTrade";
// import connect function for store
import { connect } from "react-redux";

// import Action
import {
  getSellerOrderList,  
  getBuyerOrderList,  
} from 'Actions/Trade';

import Typography from '@material-ui/core/Typography';

import { Row,Col} from "reactstrap";
import Updownarrow  from '../../../assets/icon/updownarrow.png';
import Uparrow  from '../../../assets/icon/uparrow.png';
import downarrow  from '../../../assets/icon/downarrow.png';
import $ from 'jquery';

function TabContainer({ children }) {
  return (
      <Typography component="div" style={{ padding: 8 * 3 }}>
          {children}
      </Typography>
  );
}

class BuySellTrade extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      sectionReload: true,
      activeIndex: 0,
      displayTable:0,
      sellerOrder:[],
      buyerOrder:[],
      socketBuyData:[],
      socketSellData:[],
      socketLastPriceData :[],
      lastPrice:0,
      UpDown:1,
      loadInterval:'',
      tempBuyOrders:[],
      tempSellOrders:[],
      buyOrderBit:0,
      sellOrderBit:0,
      lastPriceBuyRecord:[],
      lastPriceSellRecord:[],
      stopLimitBuyerBook:[],
      stopLimitSellerBook:[],
      LPSellerBook:[],
      socketLPSellData : [],
      LPBuyerBook:[],
      socketLPBuyData : [],
    };

    this.changeOrderBook = this.changeOrderBook.bind(this);
  }


  handleChange(event, value) {
    this.setState({ activeIndex: value });
  }

 changeOrderBook = (event,value) =>{   
    //event.preventDefault(); 
    this.setState({
      ...this.state,
      displayTable:value
    })
  }
  
   // This will invoke After component render
   componentDidMount() {    
    
    const pair = this.props.currencyPair;
    // code changed by devang parekh 22-2-2019
    if(this.props.hasOwnProperty('marginTrading') && this.props.marginTrading === 1) {
      this.props.getSellerOrderList({ Pair: pair, marginTrading:1 });
      this.props.getBuyerOrderList({ Pair: pair, marginTrading:1 });    
    } else {
      this.props.getSellerOrderList({ Pair: pair });
      this.props.getBuyerOrderList({ Pair: pair });    
    }
    //end

  }

  componentWillMount() {
  
    // code changed by devang parekh 22-2-2019
    if(this.props.hasOwnProperty('marginTrading') && this.props.marginTrading === 1) {
      this.processForMarginTrading();
    } else {
      this.processForNormalTrading();
    }
    //end
    
  }

  // code changed by devang parekh 22-2-2019
  // code for normal trading of binding buy/sell orders records
  processForNormalTrading() {

    // code added and change by devang parekh for handling Signalr listners

    this.isComponentActive = 1;
    
    // handling and store last price data
    this.props.hubConnection.on('RecieveLastPrice', (receivedMessage) => {
      if(this.isComponentActive === 1 && receivedMessage !==null ) { 

        try {

          const marketCap = JSON.parse(receivedMessage);          
          if ((marketCap.EventTime && this.state.socketLastPriceData.length === 0) || 
            (this.state.socketLastPriceData.length > 0 && marketCap.EventTime > this.state.socketLastPriceData.EventTime) ) {     
          
              if(this.props.currencyPair === marketCap.Parameter && typeof marketCap.IsMargin !== 'undefined' && marketCap.IsMargin === 0) {

                this.setState({
                  lastPrice:marketCap.Data.LastPrice,
                  upDownBit:marketCap.Data.UpDownBit,              
                  socketLastPriceData : marketCap
                })

              }
            
          } 

        } catch(error) {
          
        }         
           
      }
      
    });

    // ========== process for buyer book order updation from signalr ===========
    // RecieveBuyerBook and store into state and update
    this.props.hubConnection.on('RecieveBuyerBook', (receivedMessage) => {
      if (this.isComponentActive ===1 && receivedMessage !== null) {
        
        try {

          const receivedMessageData = JSON.parse(receivedMessage);
          
          if ((receivedMessageData.EventTime && this.state.socketBuyData.length ==0) || 
          (this.state.socketBuyData.length !== 0 && receivedMessageData.EventTime >= this.state.socketBuyData.EventTime) ) {
              
            if(this.props.currencyPair === receivedMessageData.Parameter && typeof receivedMessageData.IsMargin !== 'undefined' && receivedMessageData.IsMargin === 0) {

              const newData = receivedMessageData.Data
              
              if(parseFloat(newData.Price) !==0 ){
                
                var latestBuyOrders = $.extend(true,[],this.state.buyerOrder);
                
                latestBuyOrders.forEach(function(buyOrder,index){ latestBuyOrders[index].UpDownBit = 0 });
    
                var findIndexPrice = latestBuyOrders.findIndex(buyerOrder => parseFloat(buyerOrder.Price) === parseFloat(newData.Price));
                
                if(findIndexPrice === -1){
                  
                  if(parseFloat(newData.Amount) > 0) {
                    newData.UpDownBit = 1
                    latestBuyOrders.push(newData)
                  }
                  
                } else {
                  
                  if(parseFloat(newData.Amount) > 0) {
                    latestBuyOrders[findIndexPrice].UpDownBit = 1
                    latestBuyOrders[findIndexPrice].Amount = newData.Amount
                  } else {
                    latestBuyOrders.splice(findIndexPrice,1)
                  }
                  
                }
                
                this.setState({ buyerOrder: latestBuyOrders, socketBuyData: receivedMessageData });

              } else if(parseFloat(newData.Price) === 0 && newData.Amount >= 0) {

                this.setState({ lastPriceBuyRecord: newData, socketBuyData: receivedMessageData });
                
              }
              
            }           
    
          }
    
        } catch(error) {
        }

      }

    });

    // RecieveStopLimitBuyerBook data store into state and process
    this.props.hubConnection.on('RecieveStopLimitBuyerBook', (receivedMessage) => {
      if(this.isComponentActive === 1 && receivedMessage !==null ){ 

        try {
          
          const stopLimitBuyerBook = JSON.parse(receivedMessage);
          if ((stopLimitBuyerBook.EventTime && this.state.stopLimitBuyerBook.length === 0) || 
            (this.state.stopLimitBuyerBook.length !== 0 && stopLimitBuyerBook.EventTime > this.state.stopLimitBuyerBook.EventTime) ) {     
                if(this.props.currencyPair === stopLimitBuyerBook.Parameter && typeof stopLimitBuyerBook.IsMargin !== 'undefined' && stopLimitBuyerBook.IsMargin === 0) {
                this.setState({
                  stopLimitBuyerBook : stopLimitBuyerBook
                })
              }

          }         

        } catch(error)    {
          
        }         
           
      }
      
    });

    // get lp seller book and store into state and process
    this.props.hubConnection.on('ReceiveBulkBuyerBook', (receivedMessage) => {
      if (this.isComponentActive ===1 && receivedMessage !== null) {
        try {  
          const receivedMessageData = JSON.parse(receivedMessage);
          if ((receivedMessageData.EventTime && this.state.socketLPBuyData.length === 0) || (this.state.socketLPBuyData.length !== 0 && receivedMessageData.EventTime >= this.state.socketLPBuyData.EventTime)) {
            if(this.props.currencyPair === receivedMessageData.Parameter && typeof receivedMessageData.IsMargin !== 'undefined' && receivedMessageData.IsMargin === 0) {
              var LPBuyerBook = $.extend(true,[],this.state.LPBuyerBook);
              console.log('LPBuyerBook :',LPBuyerBook);
              LPBuyerBook[receivedMessageData.LP] = receivedMessageData.Data;
              this.setState({ LPBuyerBook: LPBuyerBook, socketLPBuyData: receivedMessageData });
            }
          }
        } catch(error) {}        
      }
    });

    /* this.props.hubConnection.on('ReceiveBulkOrderHistory', (receivedMessage) => {
      console.log('ReceiveBulkOrderHistory :',receivedMessage);
    }); */

    // ====================== end code ================================

    // ============== start code for recieve seller book from signalr ===============
    // get seller book on transaction update and store into state
    this.props.hubConnection.on('RecieveSellerBook', (receivedMessage) => {
      if (this.isComponentActive ===1 && receivedMessage !== null) {

        try {
 
          const receivedMessageData = JSON.parse(receivedMessage);
    
          if ((receivedMessageData.EventTime && this.state.socketSellData.length ==0) || 
            (this.state.socketSellData.length !== 0 && receivedMessageData.EventTime >= this.state.socketSellData.EventTime) ) {
            
            if(this.props.currencyPair === receivedMessageData.Parameter && typeof receivedMessageData.IsMargin !== 'undefined' && receivedMessageData.IsMargin === 0) {

              const newData = receivedMessageData.Data

              if(parseFloat(newData.Price) !==0 ) {
                var latestSellOrders = $.extend(true,[],this.state.sellerOrder);
    
                var findIndexPrice = latestSellOrders.findIndex(sellerOrder => parseFloat(sellerOrder.Price) === parseFloat(newData.Price));
              
                if(findIndexPrice === -1) {
    
                  if(parseFloat(newData.Amount) > 0) {
                    latestSellOrders.push(newData)
                  }
    
                } else {
    
                  if(parseFloat(newData.Amount) > 0) {
                    latestSellOrders[findIndexPrice].Amount = newData.Amount
                  } else {
                    latestSellOrders.splice(findIndexPrice,1)
                  }

                }
                
                this.setState({ sellerOrder: latestSellOrders, socketSellData: receivedMessageData });

              } else if(parseFloat(newData.Price) === 0 && newData.Amount >= 0) {

                this.setState({ lastPriceSellRecord: newData, socketSellData: receivedMessageData });
                
              }
              
            }          

         }            
    
        } catch(error) {
        }
 
      }
 
     });

     // get RecieveStopLimitSellerBook and store into state and process
     this.props.hubConnection.on('RecieveStopLimitSellerBook', (receivedMessage) => {
      if(this.isComponentActive === 1 && receivedMessage !==null ){ 

        try {

          const stopLimitSellerBook = JSON.parse(receivedMessage);
          
          if ((stopLimitSellerBook.EventTime && this.state.stopLimitSellerBook.length === 0) || 
            (this.state.stopLimitSellerBook.length !== 0 && stopLimitSellerBook.EventTime > this.state.stopLimitSellerBook.EventTime) ) {     
            
              if(this.props.currencyPair === stopLimitSellerBook.Parameter && typeof stopLimitSellerBook.IsMargin !== 'undefined' && stopLimitSellerBook.IsMargin === 0){
                this.setState({
                  stopLimitSellerBook : stopLimitSellerBook
                })
              }          
            
          }         

        } catch(error)    {
          
        }         
           
      }
      
    });

    // get lp seller book and store into state and process
    this.props.hubConnection.on('ReceiveBulkSellerBook', (receivedMessage) => {
      if (this.isComponentActive ===1 && receivedMessage !== null) {

        try {
  
          const receivedMessageData = JSON.parse(receivedMessage);
    
          if ((receivedMessageData.EventTime && this.state.socketLPSellData.length ==0) || 
            (this.state.socketLPSellData.length !== 0 && receivedMessageData.EventTime >= this.state.socketLPSellData.EventTime) ) {
            
            if(this.props.currencyPair === receivedMessageData.Parameter && typeof receivedMessageData.IsMargin !== 'undefined' && receivedMessageData.IsMargin === 0) {
              var LPSellerBook = $.extend(true,[],this.state.LPSellerBook);
              LPSellerBook[receivedMessageData.LP] = receivedMessageData.Data
              this.setState({ LPSellerBook: LPSellerBook, socketLPSellData: receivedMessageData });

            }

          }

        } catch(error) {
          
        }
        
      }

    });

    // ================ end code for seller order book process ==============================

  }

  // code for process of margin trading records buy/sell orders bind based on dashboard
  processForMarginTrading() {

    // code added and change by devang parekh for handling Signalr listners

    this.isComponentActive = 1;
    
    // handling and store last price data
    this.props.hubConnection.on('RecieveLastPrice', (receivedMessage) => {
      if(this.isComponentActive === 1 && receivedMessage !==null ) { 

        try {

          const marketCap = JSON.parse(receivedMessage);          
          if ((marketCap.EventTime && this.state.socketLastPriceData.length === 0) || 
            (this.state.socketLastPriceData.length > 0 && marketCap.EventTime > this.state.socketLastPriceData.EventTime) ) {     
            
              if(this.props.currencyPair === marketCap.Parameter && typeof marketCap.IsMargin !== 'undefined' && marketCap.IsMargin === 1) {
                this.setState({
                  lastPrice:marketCap.Data.LastPrice,
                  upDownBit:marketCap.Data.UpDownBit,              
                  socketLastPriceData : marketCap
                })
              }
            
          } 

        } catch(error) {
          
        }         
           
      }
      
    });

    // ========== process for buyer book order updation from signalr ===========
    // RecieveBuyerBook and store into state and update
    this.props.hubConnection.on('RecieveBuyerBook', (receivedMessage) => {
      if (this.isComponentActive ===1 && receivedMessage !== null) {
        
        try {

          const receivedMessageData = JSON.parse(receivedMessage);
          
          if ((receivedMessageData.EventTime && this.state.socketBuyData.length ==0) || 
          (this.state.socketBuyData.length !== 0 && receivedMessageData.EventTime >= this.state.socketBuyData.EventTime) ) {
              
            if(this.props.currencyPair === receivedMessageData.Parameter && typeof receivedMessageData.IsMargin !== 'undefined' && receivedMessageData.IsMargin === 1){

              const newData = receivedMessageData.Data
              
              if(parseFloat(newData.Price) !==0 ){
                
                var latestBuyOrders = $.extend(true,[],this.state.buyerOrder);
                
                latestBuyOrders.forEach(function(buyOrder,index){ latestBuyOrders[index].UpDownBit = 0 });
    
                var findIndexPrice = latestBuyOrders.findIndex(buyerOrder => parseFloat(buyerOrder.Price) === parseFloat(newData.Price));
                
                if(findIndexPrice === -1){
                  
                  if(parseFloat(newData.Amount) > 0) {
                    newData.UpDownBit = 1
                    latestBuyOrders.push(newData)
                  }
                  
                } else {
                  
                  if(parseFloat(newData.Amount) > 0) {
                    latestBuyOrders[findIndexPrice].UpDownBit = 1
                    latestBuyOrders[findIndexPrice].Amount = newData.Amount
                  } else {
                    latestBuyOrders.splice(findIndexPrice,1)
                  }
                  
                }
                
                this.setState({ buyerOrder: latestBuyOrders, socketBuyData: receivedMessageData });

              } else if(parseFloat(newData.Price) === 0 && newData.Amount >= 0) {

                this.setState({ lastPriceBuyRecord: newData, socketBuyData: receivedMessageData });
                
              }
              
            }           
    
          }
    
        } catch(error) {
        }

      }

    });

    // RecieveStopLimitBuyerBook data store into state and process
    this.props.hubConnection.on('RecieveStopLimitBuyerBook', (receivedMessage) => {
      if(this.isComponentActive === 1 && receivedMessage !==null ){ 

        try {
          
          const stopLimitBuyerBook = JSON.parse(receivedMessage);
          if ((stopLimitBuyerBook.EventTime && this.state.stopLimitBuyerBook.length === 0) || 
            (this.state.stopLimitBuyerBook.length !== 0 && stopLimitBuyerBook.EventTime > this.state.stopLimitBuyerBook.EventTime) ) {     
               if(this.props.currencyPair === stopLimitBuyerBook.Parameter && typeof stopLimitBuyerBook.IsMargin !== 'undefined' && stopLimitBuyerBook.IsMargin === 1){
                this.setState({
                  stopLimitBuyerBook : stopLimitBuyerBook
                })
              }

          }         

        } catch(error)    {
          
        }         
           
      }
      
    });

    // ====================== end code ================================

    // ============== start code for recieve seller book from signalr ===============
    // get seller book on transaction update and store into state
    this.props.hubConnection.on('RecieveSellerBook', (receivedMessage) => {
      if (this.isComponentActive ===1 && receivedMessage !== null) {

        try {
 
          const receivedMessageData = JSON.parse(receivedMessage);
    
          if ((receivedMessageData.EventTime && this.state.socketSellData.length ==0) || 
            (this.state.socketSellData.length !== 0 && receivedMessageData.EventTime >= this.state.socketSellData.EventTime) ) {
            
            if(this.props.currencyPair === receivedMessageData.Parameter && typeof receivedMessageData.IsMargin !== 'undefined' && receivedMessageData.IsMargin === 1) {

              const newData = receivedMessageData.Data

              if(parseFloat(newData.Price) !==0 ) {
                var latestSellOrders = $.extend(true,[],this.state.sellerOrder);
    
                var findIndexPrice = latestSellOrders.findIndex(sellerOrder => parseFloat(sellerOrder.Price) === parseFloat(newData.Price));
              
                if(findIndexPrice === -1) {
    
                  if(parseFloat(newData.Amount) > 0) {
                    latestSellOrders.push(newData)
                  }
    
                } else {
    
                  if(parseFloat(newData.Amount) > 0) {
                    latestSellOrders[findIndexPrice].Amount = newData.Amount
                  } else {
                    latestSellOrders.splice(findIndexPrice,1)
                  }

                }
                
                this.setState({ sellerOrder: latestSellOrders, socketSellData: receivedMessageData });

              } else if(parseFloat(newData.Price) === 0 && newData.Amount >= 0) {

                this.setState({ lastPriceSellRecord: newData, socketSellData: receivedMessageData });
                
              }
              
            }          

         }            
    
        } catch(error) {
        }
 
      }
 
     });

     // get RecieveStopLimitSellerBook and store into state and process
     this.props.hubConnection.on('RecieveStopLimitSellerBook', (receivedMessage) => {
      if(this.isComponentActive === 1 && receivedMessage !==null ){ 

        try {

          const stopLimitSellerBook = JSON.parse(receivedMessage);
          
          if ((stopLimitSellerBook.EventTime && this.state.stopLimitSellerBook.length === 0) || 
            (this.state.stopLimitSellerBook.length !== 0 && stopLimitSellerBook.EventTime > this.state.stopLimitSellerBook.EventTime) ) {     
            
              if(this.props.currencyPair === stopLimitSellerBook.Parameter && typeof stopLimitSellerBook.IsMargin !== 'undefined' && stopLimitSellerBook.IsMargin === 1){
                this.setState({
                  stopLimitSellerBook : stopLimitSellerBook
                })
              }          
            
          }         

        } catch(error)    {
          
        }         
           
      }
      
    });

    // get lp seller book and store into state and process
    this.props.hubConnection.on('ReceiveBulkSellerBook', (receivedMessage) => {
      if (this.isComponentActive ===1 && receivedMessage !== null) {

        try {
  
          const receivedMessageData = JSON.parse(receivedMessage);
    
          if ((receivedMessageData.EventTime && this.state.socketLPSellData.length ==0) || 
            (this.state.socketLPSellData.length !== 0 && receivedMessageData.EventTime >= this.state.socketLPSellData.EventTime) ) {
            
            if(this.props.currencyPair === receivedMessageData.Parameter && typeof receivedMessageData.IsMargin !== 'undefined' && receivedMessageData.IsMargin === 1) {
              var LPSellerBook = $.extend(true,[],this.state.LPSellerBook);
              LPSellerBook[receivedMessageData.LP] = receivedMessageData.Data
              this.setState({ LPSellerBook: LPSellerBook, socketLPSellData: receivedMessageData });

            }

          }

        } catch(error) {
          
        }
        
      }

    });

    // ================ end code for seller order book process ==============================
    
  }
  // code end

  updateBuyerOrderBook(buyerOrderList) {
    this.setState({buyerOrder:buyerOrderList})
  }

  updateSellerOrderBook(sellerOrderList) {
    this.setState({sellerOrder:sellerOrderList})
  }  

  componentWillUnmount() {
    this.isComponentActive = 0;
  }

  componentWillReceiveProps(nextprops){
    
    if(nextprops.buyerOrder && this.state.buyOrderBit !== nextprops.buyerOrderBit){

      var lastPriceBuyRecord = {};
      var newBuyerOrderDetail = [];
      var stopLimitBuyerBook = [];
      stopLimitBuyerBook.Data = [];

      nextprops.buyerOrder.map(function(buyOrderDetail,buyOrderIndex) { 
        
        if(parseFloat(buyOrderDetail.Price) === 0 && parseFloat(buyOrderDetail.Amount) > 0) {
          lastPriceBuyRecord = buyOrderDetail;
        } else if(buyOrderDetail.IsStopLimit === 1) {
          buyOrderDetail.IsAdd = 1;
          stopLimitBuyerBook.Data.push(buyOrderDetail)
        } else {
          buyOrderDetail.UpDownBit = 0;
          newBuyerOrderDetail.push(buyOrderDetail);
        }

      });

      this.setState({
        buyerOrder: newBuyerOrderDetail,
        buyOrderBit:nextprops.buyerOrderBit,
        lastPriceBuyRecord:lastPriceBuyRecord,
        stopLimitBuyerBook : stopLimitBuyerBook
      })

    } else if (nextprops.buyerOrder.length === 0  && this.state.buyOrderBit !== nextprops.buyerOrderBit) {
      this.setState({
        buyerOrder: [],
        buyOrderBit:nextprops.buyerOrderBit,
        lastPriceBuyRecord:{},
        stopLimitBuyerBook : []
      })
    }

    if(nextprops.sellerOrder && this.state.sellOrderBit !== nextprops.sellerOrderBit){
      
      var sellerData =[];
      var lastPriceSellRecord = {};
      var stopLimitSellerBook = [];
      stopLimitSellerBook.Data = [];    

      nextprops.sellerOrder.map((newData,key) =>{

        if(parseFloat(newData.Price) === 0 && parseFloat(newData.Amount) > 0) {
          lastPriceSellRecord = newData;
        } else if(newData.IsStopLimit === 1) {
          newData.IsAdd = 1;
          stopLimitSellerBook.Data.push(newData)
        } else {
          newData.UpDownBit = 0;
          sellerData.push(newData);
        }

      })
      
      sellerData.sort(function(a, b) {      
        return parseFloat(b.Price) - parseFloat(a.Price)
      })

     this.setState({
        sellerOrder: sellerData,
        sellOrderBit:nextprops.sellerOrderBit,
        lastPriceSellRecord:lastPriceSellRecord,
        stopLimitSellerBook : stopLimitSellerBook,
        LPSellerBook:[],
        socketLPSellData : []
      })     

    } else if (nextprops.sellerOrder.length === 0  && this.state.sellOrderBit !== nextprops.sellerOrderBit) {
      this.setState({
        sellerOrder: [],
        sellOrderBit:nextprops.sellerOrderBit,
        lastPriceSellRecord:{},
        stopLimitSellerBook : [],
        LPSellerBook:[],
        socketLPSellData : []
      })
    }

    if(nextprops.currentMarketCap && nextprops.currentMarketCap.LastPrice && nextprops.currentMarketCap.LastPrice > 0) {
      this.setState({lastPrice:nextprops.currentMarketCap.LastPrice})
    }

  }

  
  // Render Component for Buy Sell Tables
  render() {
     
    const { buyerOrder, sellerOrder, lastPriceBuyRecord, lastPriceSellRecord, lastPrice, stopLimitBuyerBook, stopLimitSellerBook, LPSellerBook, LPBuyerBook} = this.state;
    
    var buyOrderDetail = $.extend(true,[],buyerOrder);
    var lastPriceBuyRecordDetail = $.extend(true,[],lastPriceBuyRecord);
    var stopLimitBuyerBookList = $.extend(true,[],stopLimitBuyerBook.Data);
    var LPBuyerBookList = $.extend(true,[],LPBuyerBook); //Added by salim dt:22/06/2019...
    if(lastPrice > 0 && lastPriceBuyRecordDetail && lastPriceBuyRecordDetail.Amount > 0) {

      var findLastPriceIndex = buyOrderDetail.findIndex(buyerOrder => parseFloat(buyerOrder.Price) === parseFloat(lastPrice));
               if(findLastPriceIndex === -1){
        
        lastPriceBuyRecordDetail.UpDownBit = 1;
        lastPriceBuyRecordDetail.Price = lastPrice;
        buyOrderDetail.push(lastPriceBuyRecordDetail)

      } else {
        buyOrderDetail[findLastPriceIndex].UpDownBit = 1
        buyOrderDetail[findLastPriceIndex].Amount = buyOrderDetail[findLastPriceIndex].Amount + lastPriceBuyRecordDetail.Amount;

      }
        
    }

    if(stopLimitBuyerBookList && stopLimitBuyerBookList.length > 0) {

      stopLimitBuyerBookList.map((stopLimitOrder, indexValue) => {

        if(stopLimitOrder.IsAdd && stopLimitOrder.IsAdd === 1) {

          var findStopLimitIndex = buyOrderDetail.findIndex(buyerOrder => parseFloat(buyerOrder.Price) === parseFloat(stopLimitOrder.Price));
                  if(findStopLimitIndex === -1){
            
            stopLimitOrder.UpDownBit = 1;
            buyOrderDetail.push(stopLimitOrder)

          } else {
            buyOrderDetail[findStopLimitIndex].UpDownBit = 1
            buyOrderDetail[findStopLimitIndex].Amount = buyOrderDetail[findStopLimitIndex].Amount + stopLimitOrder.Amount;

          }

        }
        
      });
        
    }

    //Added by salim dt:22/06/2019.....
    if(LPBuyerBookList && LPBuyerBookList.length > 0) {
      LPBuyerBookList.forEach(function(LPBuyerBook,index){
        LPBuyerBook.map((LPBuyOrder, indexValue) => {
            var findLPIndex = buyOrderDetail.findIndex(sellerOrder => parseFloat(sellerOrder.Price) === parseFloat(LPBuyOrder.Price));
            if(findLPIndex === -1){              
              LPBuyOrder.UpDownBit = 1;
              buyOrderDetail.push(LPBuyOrder);
            } else {
              buyOrderDetail[findLPIndex].UpDownBit = 1;
              buyOrderDetail[findLPIndex].Amount = buyOrderDetail[findLPIndex].Amount + LPBuyOrder.Amount;
            }            
        });
      });      
    }

    this.state.tempBuyOrders = buyOrderDetail;

    var lastPriceSellRecordDetail = $.extend(true,[],lastPriceSellRecord);
    var sellOrderDetail = $.extend(true,[],sellerOrder);
    var stopLimitSellerBookList = $.extend(true,[],stopLimitSellerBook.Data);
    var LPSellerBookList = $.extend(true,[],LPSellerBook);

    if(lastPrice > 0 && lastPriceSellRecordDetail && lastPriceSellRecordDetail.Amount > 0) {

      var findLastPriceIndex = sellOrderDetail.findIndex(sellerOrder => parseFloat(sellerOrder.Price) === parseFloat(lastPrice));
                
      if(findLastPriceIndex === -1){
        
        lastPriceSellRecordDetail.UpDownBit = 1;
        lastPriceSellRecordDetail.Price = lastPrice;
        sellOrderDetail.push(lastPriceSellRecordDetail)

      } else {
        
        sellOrderDetail[findLastPriceIndex].UpDownBit = 1
        sellOrderDetail[findLastPriceIndex].Amount = sellOrderDetail[findLastPriceIndex].Amount + lastPriceSellRecordDetail.Amount;

      }
        
    }

    if(stopLimitSellerBookList && stopLimitSellerBookList.length > 0) {

      stopLimitSellerBookList.map((stopLimitOrder, indexValue) => {

        if(stopLimitOrder.IsAdd && stopLimitOrder.IsAdd === 1) {

          var findStopLimitIndex = sellOrderDetail.findIndex(sellerOrder => parseFloat(sellerOrder.Price) === parseFloat(stopLimitOrder.Price));
                  if(findStopLimitIndex === -1){
            
            stopLimitOrder.UpDownBit = 1;
            sellOrderDetail.push(stopLimitOrder)

          } else {
            sellOrderDetail[findStopLimitIndex].UpDownBit = 1
            sellOrderDetail[findStopLimitIndex].Amount = sellOrderDetail[findStopLimitIndex].Amount + stopLimitOrder.Amount;

          }

        }
        
      });
        
    }

    if(LPSellerBookList && LPSellerBookList.length > 0) {

      LPSellerBookList.forEach(function(LPSellerBook,index){
      
        LPSellerBook.map((LPSellOrder, indexValue) => {

            var findLPIndex = sellOrderDetail.findIndex(sellerOrder => parseFloat(sellerOrder.Price) === parseFloat(LPSellOrder.Price));
                   if(findLPIndex === -1){
              
              LPSellOrder.UpDownBit = 1;
              sellOrderDetail.push(LPSellOrder)
  
            } else {
              sellOrderDetail[findLPIndex].UpDownBit = 1
              sellOrderDetail[findLPIndex].Amount = sellOrderDetail[findLPIndex].Amount + LPSellOrder.Amount;
  
            }
            
        });

      });
      
    }

    this.state.tempSellOrders = sellOrderDetail;

    if(this.state.lastPrice != 'undefined' && this.state.lastPrice !=0){
      var firstPrice = parseFloat(this.state.lastPrice).toFixed(8); 
    }else{
      var firstPrice = parseFloat(0).toFixed(8); 
    }
    return (
      
      <div>
        <div className="activetitle">
        <div className="activetitleTrade">
          <Row>
            <Col md={8} xs={8}>
            <h3>{<IntlMessages id="trading.newTrading.activetardes.text"/>}</h3>
            </Col>
            <Col md={4} xs={4}> 
              <ul>
                <li><a href="#" onClick={(event) =>this.changeOrderBook(event,0)} className={this.state.displayTable == 0 ? 'active': ''}><img src={Updownarrow} /></a></li>
                <li><a href="#" onClick={(event) =>this.changeOrderBook(event,1)} className={this.state.displayTable == 1 ? 'active':''}><img src={Uparrow} /></a></li>
                <li><a href="#" onClick={(event) =>this.changeOrderBook(event,2)} className={this.state.displayTable == 2 ? 'active':''}><img src={downarrow} /></a></li>
              </ul>               
            </Col>
            </Row>
          </div>
        
        <h5><IntlMessages id="trading.marketcap.label.lastprice" /> {" " + firstPrice + " "} ({this.props.secondCurrency})</h5>
        </div>
        {/* <span>Last Price 0.4712 USDT</span> */}
          {this.state.displayTable === 0 ?          
            <div className="pb-10" >
              
              <SellTrade  firstCurrency={this.props.firstCurrency}
                          secondCurrency={this.props.secondCurrency}
                          currencyPair={this.props.currencyPair}
                          firstCurrencyBalance={this.props.firstCurrencyBalance}
                          secondCurrencyBalance={this.props.secondCurrencyBalance}
                          displayTable={false}
                          autoHeightMin={119}
                          autoHeightMax={119}
                          hubConnection={this.props.hubConnection}
                          setData = {this.props.setBuyOrders}
                          sellerOrderList={this.state.tempSellOrders}
                          sellerOrderBit = {this.props.sellerOrderBit}
                          updateSellerOrderBook={this.updateSellerOrderBook}
                        />

              <BuyTrade   firstCurrency={this.props.firstCurrency}
                          UpDownBit={this.props.UpDownBit}
                          secondCurrency={this.props.secondCurrency}
                          currencyPair={this.props.currencyPair}
                          firstCurrencyBalance={this.props.firstCurrencyBalance}
                          secondCurrencyBalance={this.props.secondCurrencyBalance}
                          autoHeightMin={119}
                          displayTable={false}
                          autoHeightMax={119}
                          hubConnection={this.props.hubConnection}                
                          setData = {this.props.setSellOrders}
                          buyerOrderList={this.state.tempBuyOrders}
                          buyerOrderBit = {this.props.buyerOrderBit}
                          updateBuyerOrderBook={this.updateBuyerOrderBook}
                        />
            </div>    : ''      
          }

          {this.state.displayTable === 1 ?        
            <div className="pb-5" >            
              <BuyTrade
                        {...this.props} 
                          firstCurrency={this.props.firstCurrency}
                          UpDownBit={this.props.UpDownBit}
                          secondCurrency={this.props.secondCurrency}
                          currencyPair={this.props.currencyPair}
                          firstCurrencyBalance={this.props.firstCurrencyBalance}
                          secondCurrencyBalance={this.props.secondCurrencyBalance}                
                          hubConnection={this.props.hubConnection}                
                          displayTable={true}
                          setData = {this.props.setSellOrders}                
                          autoHeightMin={280}
                          autoHeightMax={280}
                          updateBuyerOrderBook={this.updateBuyerOrderBook}
                          buyerOrderList={this.state.tempBuyOrders}
                        />
            </div>     : ''     
          }

          {this.state.displayTable === 2 ?          
            <div className="pb-3" >            
              <SellTrade
                        {...this.props} 
                            firstCurrency={this.props.firstCurrency}
                            secondCurrency={this.props.secondCurrency}
                            currencyPair={this.props.currencyPair}
                            firstCurrencyBalance={this.props.firstCurrencyBalance}
                            secondCurrencyBalance={this.props.secondCurrencyBalance}
                            displayTable={true}
                            autoHeightMin={298}
                            autoHeightMax={298}
                            hubConnection={this.props.hubConnection}
                            setData = {this.props.setBuyOrders}
                            updateSellerOrderBook={this.updateSellerOrderBook}
                            sellerOrderList={this.state.tempSellOrders}
                          />
            </div>  : ''
          }
      </div>
    );
  }
}

const mapStateToProps = ({ buyerOrder,sellerOrder,settings,currentMarketCap }) => {

  return {
    buyerOrder: buyerOrder.buyerOrder, 
    sellerOrder: sellerOrder.sellerOrder,
    buyerOrderBit:buyerOrder.buyerOrderBit, 
    sellerOrderBit:sellerOrder.sellerOrderBit, 
    darkMode:settings.darkMode,
    currentMarketCap: currentMarketCap.currentMarketCap
  };
 
}

export default connect(
  mapStateToProps,
  {
    getBuyerOrderList,    
    getSellerOrderList,    
  }
)(BuySellTrade);


