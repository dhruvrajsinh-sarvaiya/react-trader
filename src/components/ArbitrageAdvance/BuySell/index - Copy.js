/**
 * Author : Tejas
 * Created : 27/05/2019
 *  Arbitrage Buy & Sell order book component..
*/

import React from "react";

// used fro connect store
import { connect } from "react-redux";
// components for display 
import BuyTrade from "./BuyTrade";
import SellTrade from "./SellTrade";
import BuySellForm from "../BuySellForm";

//actions 
import { atbitrageBuyerBook, atbitrageSellerBook } from 'Actions/Arbitrage';

// used for jquery
import $ from 'jquery';
import socketIOClient from "socket.io-client";

import AppConfig from 'Constants/AppConfig';
const SocketURl = AppConfig.socketUrl;

// class for handle components 
class BuySellTrade extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			sellerOrder: [],
			buyerOrder: [],
			socketBuyData: [],
			socketSellData: [],
			socketLastPriceData: [],
			lastPrice: 0,
			UpDown: 1,
			//isComponentActive:1,
			loadInterval: '',
			tempBuyOrders: [],
			tempSellOrders: [],
			buyOrderBit: 0,
			sellOrderBit: 0,
			lastPriceBuyRecord: [],
			lastPriceSellRecord: [],
			stopLimitBuyerBook: [],
			stopLimitSellerBook: [],
			LPSellerBook: [],
			socketLPSellData: [],
			exchangeList:[],
			
		};

		this.exchangeList = [];
		this.sockets = {};
		this.displayArbitrage = 0;
	}

	// This will invoke After component render
	componentDidMount() {
		const pair = this.props.currencyPair;
		// code changed by devang parekh 22-2-2019
		this.props.atbitrageBuyerBook({ Pair: pair });
		this.props.atbitrageSellerBook({ Pair: pair });
		//end
	}

	componentWillMount() {

		
		
	}

	componentWillUnmount() {
		this.isComponentActive = 0;
		this.displayArbitrage = 0;
	}

	componentWillReceiveProps(nextprops) {

		if (nextprops.arbitrageBuyerOrder && nextprops.arbitrageBuyerOrder !== null && this.state.buyOrderBit !== nextprops.arbitrageBuyerOrderBit) {

			/* var exchangeList = [];
			nextprops.arbitrageBuyerOrder.map((exchange) => {
				exchangeList[exchange.ProviderName.toLowerCase()] = {LTP:0.0};				
			});
			this.displayArbitrage = 1;
			this.exchangeList = exchangeList; */
			
			//disconnect from server
            /* if(Object.keys(this.sockets).length) {
                Object.keys(this.sockets).map((ProviderName) => {
                    this.sockets[ProviderName].disconnect();
				});
				this.sockets = {};
			} */
			
			this.setState({
				buyerOrder: nextprops.arbitrageBuyerOrder,
				buyOrderBit: nextprops.arbitrageBuyerOrderBit,
				//exchangeList:exchangeList
			});
			//this.connectWebSocket();

		} else if (nextprops.arbitrageBuyerOrder && nextprops.arbitrageBuyerOrder.length === 0 && this.state.buyOrderBit !== nextprops.arbitrageBuyerOrderBit) {
			
			//disconnect from server
            /* if(Object.keys(this.sockets).length) {
                Object.keys(this.sockets).map((ProviderName) => {
                    this.sockets[ProviderName].disconnect();
				});
				this.sockets = {};
			}

			this.displayArbitrage = 0;
			this.exchangeList = []; */
			this.setState({
				buyerOrder: [],
				buyOrderBit: nextprops.arbitrageBuyerOrderBit,
				//exchangeList : []
			});
			//this.connectWebSocket(); // need to disconnect socket

		} else if ((nextprops.arbitrageBuyerOrder === null || typeof nextprops.arbitrageBuyerOrder == undefined) && this.state.buyOrderBit !== nextprops.arbitrageBuyerOrderBit) {

			//disconnect from server
            /* if(Object.keys(this.sockets).length) {
                Object.keys(this.sockets).map((ProviderName) => {
                    this.sockets[ProviderName].disconnect();
				});
				this.sockets = {};
			}

			this.displayArbitrage = 0;
			this.exchangeList = []; */
			this.setState({
				buyerOrder: [],
				buyOrderBit: nextprops.arbitrageBuyerOrderBit,
				//exchangeList : []
			});
			//this.connectWebSocket(); // need to disconnect socket

		}

		if (nextprops.arbitrageSellerOrder && nextprops.arbitrageSellerOrder !== null && this.state.sellOrderBit !== nextprops.arbitrageSellerOrderBit) {

			this.setState({
				sellerOrder: nextprops.arbitrageSellerOrder,
				sellOrderBit: nextprops.arbitrageSellerOrderBit
			});

		} else if (nextprops.arbitrageSellerOrder && nextprops.arbitrageSellerOrder.length === 0 && this.state.sellOrderBit !== nextprops.arbitrageSellerOrderBit) {
			
			this.setState({
				sellerOrder: [],
				sellOrderBit: nextprops.arbitrageSellerOrderBit
			});

		} else if ((nextprops.arbitrageSellerOrder === null || typeof nextprops.arbitrageSellerOrder == undefined) && this.state.sellOrderBit !== nextprops.arbitrageSellerOrderBit) {

			this.setState({
				sellerOrder: [],
				sellOrderBit: nextprops.arbitrageSellerOrderBit
			});

		}

		if (nextprops.currentMarketCap && nextprops.currentMarketCap.LastPrice && nextprops.currentMarketCap.LastPrice > 0) {
			this.setState({ lastPrice: nextprops.currentMarketCap.LastPrice });
		}
	}

	// set sell order 
	setSellOrders = (price, amount, isMultiple, OrderId, total, selectedValue) => {

		if (total !== "" && total !== undefined) {
			if (isMultiple === true) {

				if (this.state.sellerOrder && this.state.sellerOrder.length) {

					let sellOrderData = [];

					this.state.sellerOrder.map((sellOrder, index) => {

						sellOrder.isMultiSelect !== undefined ? sellOrder.isMultiSelect = false : sellOrder.isMultiSelect = undefined
						sellOrderData.push(sellOrder);
						//	return null
					})
				}

				if (this.state.buyerOrder && this.state.buyerOrder.length) {

					let buyOrderData = [];

					this.state.buyerOrder.map((buyOrder, index) => {

						buyOrderData.push(buyOrder)
						if (buyOrder.LPType == OrderId
							&& (buyOrder.isMultiSelect === undefined ||
								buyOrder.isMultiSelect === false)) {

							buyOrderData[index].isMultiSelect = true
							buyOrderData[index].checkedBtn = selectedValue

						} else if (buyOrder.LPType == OrderId
							&& buyOrder.isMultiSelect !== undefined &&
							buyOrder.isMultiSelect === true) {

							buyOrderData[index].checkedBtn = selectedValue
							//buyOrderData[index].isMultiSelect = false
						}
						//	return null
					})

					this.setState({ buyerOrder: buyOrderData })
				}

				this.props.setSellOrders(price, amount, isMultiple, total, OrderId)
			} else if (isMultiple === false) {

				if (this.state.sellerOrder && this.state.sellerOrder.length) {

					let sellOrderData = [];

					this.state.sellerOrder.map((sellOrder, index) => {

						sellOrder.isMultiSelect !== undefined ? sellOrder.isMultiSelect = false : sellOrder.isMultiSelect = undefined
						sellOrderData.push(sellOrder);
						//return null
					})
				}

				if (this.state.buyerOrder && this.state.buyerOrder.length) {

					let buyOrderData = [];

					this.state.buyerOrder.map((buyOrder, index) => {

						buyOrderData.push(buyOrder)
						if (buyOrder.LPType == OrderId
							&& (buyOrder.isMultiSelect === undefined ||
								buyOrder.isMultiSelect === false)) {

							buyOrderData[index].isMultiSelect = true
							buyOrderData[index].checkedBtn = 25

						} else if (buyOrder.LPType == OrderId
							&& buyOrder.isMultiSelect !== undefined &&
							buyOrder.isMultiSelect === true) {

							buyOrderData[index].isMultiSelect = false
							buyOrderData[index].checkedBtn = 25
						}
						//return null
					})

					this.setState({ buyerOrder: buyOrderData })
				}

				this.props.setSellOrders(price, amount, isMultiple, total, OrderId)
			}

			if (isMultiple === undefined) {

				let buyOrderData = [];
				let sellOrderData = [];

				if (this.state.buyerOrder && this.state.buyerOrder.length) {
					this.state.buyerOrder.map((buyOrder, index) => {

						buyOrder.isMultiSelect !== undefined ? buyOrder.isMultiSelect = false : buyOrder.isMultiSelect = undefined

						buyOrderData.push(buyOrder);
						//return null
					})
				}

				if (this.state.sellerOrder && this.state.sellerOrder.length) {
					this.state.sellerOrder.map((sellOrder, index) => {

						sellOrder.isMultiSelect !== undefined ? sellOrder.isMultiSelect = false : sellOrder.isMultiSelect = undefined
						sellOrderData.push(sellOrder);
						//return null
					})
				}

				this.setState({
					buyerOrder: buyOrderData,
					sellerOrder: sellOrderData
				})

				this.props.setSellOrders(price, amount, isMultiple, total, OrderId)
			}

		} else {

			if (isMultiple === true) {

				if (this.state.sellerOrder && this.state.sellerOrder.length) {

					let sellOrderData = [];

					this.state.sellerOrder.map((sellOrder, index) => {

						sellOrder.isMultiSelect !== undefined ? sellOrder.isMultiSelect = false : sellOrder.isMultiSelect = undefined
						sellOrderData.push(sellOrder);
						//return null
					})
				}

				if (this.state.buyerOrder && this.state.buyerOrder.length) {

					let buyOrderData = [];

					this.state.buyerOrder.map((buyOrder, index) => {

						buyOrderData.push(buyOrder)
						if (buyOrder.LPType == OrderId
							&& (buyOrder.isMultiSelect === undefined ||
								buyOrder.isMultiSelect === false)) {

							buyOrderData[index].isMultiSelect = true
							buyOrderData[index].checkedBtn = 25

						} else if (buyOrder.LPType == OrderId
							&& buyOrder.isMultiSelect !== undefined &&
							buyOrder.isMultiSelect === true) {

							buyOrderData[index].isMultiSelect = false
							buyOrderData[index].checkedBtn = 25
						}
						//return null
					})

					this.setState({ buyerOrder: buyOrderData })
				}

				this.props.setSellOrders(price, amount, isMultiple, total, OrderId)
			} else if (isMultiple === false) {

				if (this.state.sellerOrder && this.state.sellerOrder.length) {

					let sellOrderData = [];

					this.state.sellerOrder.map((sellOrder, index) => {

						sellOrder.isMultiSelect !== undefined ? sellOrder.isMultiSelect = false : sellOrder.isMultiSelect = undefined
						sellOrderData.push(sellOrder);
						//return null
					})
				}

				if (this.state.buyerOrder && this.state.buyerOrder.length) {

					let buyOrderData = [];

					this.state.buyerOrder.map((buyOrder, index) => {

						buyOrderData.push(buyOrder)
						if (buyOrder.LPType == OrderId
							&& (buyOrder.isMultiSelect === undefined ||
								buyOrder.isMultiSelect === false)) {

							buyOrderData[index].isMultiSelect = true
							buyOrderData[index].checkedBtn = 25

						} else if (buyOrder.LPType == OrderId
							&& buyOrder.isMultiSelect !== undefined &&
							buyOrder.isMultiSelect === true) {

							buyOrderData[index].isMultiSelect = false
							buyOrderData[index].checkedBtn = 25
						}
						//return null
					})

					this.setState({ buyerOrder: buyOrderData })
				}

				this.props.setSellOrders(price, amount, isMultiple, total, OrderId)
			}

			if (isMultiple === undefined) {

				let buyOrderData = [];
				let sellOrderData = [];

				if (this.state.buyerOrder && this.state.buyerOrder.length) {
					this.state.buyerOrder.map((buyOrder, index) => {

						buyOrder.isMultiSelect !== undefined ? buyOrder.isMultiSelect = false : buyOrder.isMultiSelect = undefined

						buyOrderData.push(buyOrder);
						//	return null
					})
				}

				if (this.state.sellerOrder && this.state.sellerOrder.length) {
					this.state.sellerOrder.map((sellOrder, index) => {

						sellOrder.isMultiSelect !== undefined ? sellOrder.isMultiSelect = false : sellOrder.isMultiSelect = undefined
						sellOrderData.push(sellOrder);
						//	return null
					})
				}

				this.setState({
					buyerOrder: buyOrderData,
					sellerOrder: sellOrderData
				})

				this.props.setSellOrders(price, amount, isMultiple, total, OrderId)
			}
		}

	}

	//set buy orders
	setBuyOrders = (price, amount, isMultiple, OrderId, total, selectedValue) => {

		if (total !== "" && total !== undefined) {
			if (isMultiple === true) {

				if (this.state.buyerOrder && this.state.buyerOrder.length) {

					let buyOrderData = [];

					this.state.buyerOrder.map((buyOrder, index) => {

						buyOrder.isMultiSelect !== undefined ? buyOrder.isMultiSelect = false : buyOrder.isMultiSelect = undefined
						buyOrderData.push(buyOrder);
						//return null
					})
				}

				if (this.state.sellerOrder && this.state.sellerOrder.length) {

					let sellOrderData = [];

					this.state.sellerOrder.map((sellOrder, index) => {

						sellOrderData.push(sellOrder)
						if (sellOrder.LPType == OrderId
							&& (sellOrder.isMultiSelect === undefined ||
								sellOrder.isMultiSelect === false)) {

							sellOrderData[index].isMultiSelect = true
							sellOrderData[index].checkedBtn = selectedValue

						} else if (sellOrder.LPType == OrderId
							&& sellOrder.isMultiSelect !== undefined &&
							sellOrder.isMultiSelect === true) {

							sellOrderData[index].checkedBtn = selectedValue
							//sellOrderData[index].isMultiSelect = false
						}
						//return null
					})

					this.setState({ sellerOrder: sellOrderData })
				}

				this.props.setBuyOrders(price, amount, isMultiple, total, OrderId)
			} else if (isMultiple === false) {

				if (this.state.buyerOrder && this.state.buyerOrder.length) {

					let buyOrderData = [];

					this.state.buyerOrder.map((buyOrder, index) => {

						buyOrder.isMultiSelect !== undefined ? buyOrder.isMultiSelect = false : buyOrder.isMultiSelect = undefined
						buyOrderData.push(buyOrder);
						//return null
					})
				}

				if (this.state.sellerOrder && this.state.sellerOrder.length) {

					let sellOrderData = [];

					this.state.sellerOrder.map((sellOrder, index) => {

						sellOrderData.push(sellOrder)
						if (sellOrder.LPType == OrderId
							&& (sellOrder.isMultiSelect === undefined ||
								sellOrder.isMultiSelect === false)) {

							sellOrderData[index].isMultiSelect = true
							sellOrderData[index].checkedBtn = 25

						} else if (sellOrder.LPType == OrderId
							&& sellOrder.isMultiSelect !== undefined &&
							sellOrder.isMultiSelect === true) {

							sellOrderData[index].isMultiSelect = false
							sellOrderData[index].checkedBtn = 25
						}
						//return null
					})

					this.setState({ sellerOrder: sellOrderData })
				}

				this.props.setBuyOrders(price, amount, isMultiple, total, OrderId)
			}


			if (isMultiple === undefined) {

				let buyOrderData = [];
				let sellOrderData = [];

				if (this.state.buyerOrder && this.state.buyerOrder.length) {
					this.state.buyerOrder.map((buyOrder, index) => {

						buyOrder.isMultiSelect !== undefined ? buyOrder.isMultiSelect = false : buyOrder.isMultiSelect = undefined

						buyOrderData.push(buyOrder);
						//return null
					})
				}

				if (this.state.sellerOrder && this.state.sellerOrder.length) {
					this.state.sellerOrder.map((buyOrder, index) => {

						buyOrder.isMultiSelect !== undefined ? buyOrder.isMultiSelect = false : buyOrder.isMultiSelect = undefined
						sellOrderData.push(buyOrder);
						//return null
					})
				}

				this.setState({
					buyerOrder: buyOrderData,
					sellerOrder: sellOrderData
				})

				this.props.setBuyOrders(price, amount, isMultiple, total, OrderId)
			}
		} else {
			if (isMultiple === true) {
				if (this.state.buyerOrder && this.state.buyerOrder.length) {

					let buyOrderData = [];

					this.state.buyerOrder.map((buyOrder, index) => {

						buyOrder.isMultiSelect !== undefined ? buyOrder.isMultiSelect = false : buyOrder.isMultiSelect = undefined
						buyOrderData.push(buyOrder);
						//	return null
					})
				}

				if (this.state.sellerOrder && this.state.sellerOrder.length) {

					let sellOrderData = [];

					this.state.sellerOrder.map((sellOrder, index) => {

						sellOrderData.push(sellOrder)
						if (sellOrder.LPType == OrderId
							&& (sellOrder.isMultiSelect === undefined ||
								sellOrder.isMultiSelect === false)) {

							sellOrderData[index].isMultiSelect = true
							sellOrderData[index].checkedBtn = 25

						} else if (sellOrder.LPType == OrderId
							&& sellOrder.isMultiSelect !== undefined &&
							sellOrder.isMultiSelect === true) {

							sellOrderData[index].isMultiSelect = false
							sellOrderData[index].checkedBtn = 25
						}
						//return null
					})

					this.setState({ sellerOrder: sellOrderData })
				}

				this.props.setBuyOrders(price, amount, isMultiple, total, OrderId)

			} else if (isMultiple === false) {

				if (this.state.buyerOrder && this.state.buyerOrder.length) {

					let buyOrderData = [];

					this.state.buyerOrder.map((buyOrder, index) => {

						buyOrder.isMultiSelect !== undefined ? buyOrder.isMultiSelect = false : buyOrder.isMultiSelect = undefined
						buyOrderData.push(buyOrder);
						//	return null
					})
				}

				if (this.state.sellerOrder && this.state.sellerOrder.length) {

					let sellOrderData = [];

					this.state.sellerOrder.map((sellOrder, index) => {

						sellOrderData.push(sellOrder)
						if (sellOrder.LPType == OrderId
							&& (sellOrder.isMultiSelect === undefined ||
								sellOrder.isMultiSelect === false)) {

							sellOrderData[index].isMultiSelect = true
							sellOrderData[index].checkedBtn = 25

						} else if (sellOrder.LPType == OrderId
							&& sellOrder.isMultiSelect !== undefined &&
							sellOrder.isMultiSelect === true) {

							sellOrderData[index].isMultiSelect = false
							sellOrderData[index].checkedBtn = 25
						}
						//	return null
					})

					this.setState({ sellerOrder: sellOrderData })
				}

				this.props.setBuyOrders(price, amount, isMultiple, total, OrderId)
			}


			if (isMultiple === undefined) {

				let buyOrderData = [];
				let sellOrderData = [];

				if (this.state.buyerOrder && this.state.buyerOrder.length) {
					this.state.buyerOrder.map((buyOrder, index) => {

						buyOrder.isMultiSelect !== undefined ? buyOrder.isMultiSelect = false : buyOrder.isMultiSelect = undefined

						buyOrderData.push(buyOrder);
						//return null
					})
				}

				if (this.state.sellerOrder && this.state.sellerOrder.length) {
					this.state.sellerOrder.map((buyOrder, index) => {

						buyOrder.isMultiSelect !== undefined ? buyOrder.isMultiSelect = false : buyOrder.isMultiSelect = undefined
						sellOrderData.push(buyOrder);
						//return null
					})
				}

				this.setState({
					buyerOrder: buyOrderData,
					sellerOrder: sellOrderData
				})

				this.props.setBuyOrders(price, amount, isMultiple, total, OrderId)
			}
		}



	}

	ClearAllFields = () => {

		let buyOrderData = [];
		let sellOrderData = [];

		if (this.state.buyerOrder && this.state.buyerOrder.length) {
			this.state.buyerOrder.map((buyOrder, index) => {

				buyOrder.isMultiSelect !== undefined ? buyOrder.isMultiSelect = false : buyOrder.isMultiSelect = undefined

				buyOrderData.push(buyOrder);
			})
		}

		if (this.state.sellerOrder && this.state.sellerOrder.length) {
			this.state.sellerOrder.map((buyOrder, index) => {

				buyOrder.isMultiSelect !== undefined ? buyOrder.isMultiSelect = false : buyOrder.isMultiSelect = undefined
				sellOrderData.push(buyOrder);
			})
		}

		this.setState({
			buyerOrder: buyOrderData,
			sellerOrder: sellOrderData,

		})

		this.props.ClearAllFields()
	}

/* 	updateExchangeListLTP = (exchangeList) => {
		this.setState({exchangeList:exchangeList});
	};

	connectWebSocket() {
		var self = this;

		Object.keys(self.exchangeList).map((ProviderName) => {
			
			this.sockets[ProviderName] = socketIOClient(SocketURl+ProviderName,{query:{pair:this.props.currencyPair === 'BTC_USD' ? 'BTC_USDT' : this.props.currencyPair,channelID:AppConfig.tickerChannelID}});
			this.sockets[ProviderName].on(ProviderName+(this.props.currencyPair === 'BTC_USD' ? 'BTC_USDT' : this.props.currencyPair).split('_').join(''), async (data) => {

				if(this.displayArbitrage) {
					self.exchangeList[ProviderName].OldLTP = self.exchangeList[ProviderName].LTP;
					self.exchangeList[ProviderName].LTP = data.last;
					self.updateExchangeListLTP(self.exchangeList);
				}
				
			});

		});
		
	} */

	// Render Component for Buy Sell Tables
	render() {

		const { buyerOrder, sellerOrder/* ,exchangeList */ } = this.state;
		const {exchangeList} = this.props;

		var buyOrderDetail = $.extend(true, [], buyerOrder);
		this.state.tempBuyOrders = buyOrderDetail
	
		var sellOrderDetail = $.extend(true, [], sellerOrder);
		this.state.tempSellOrders = sellOrderDetail;

		return (
			<div className="buy_sell_area_inner align-items-start">
				<div className="w-40 sell_book pr-0 pl-0">
					<SellTrade
						{...this.props}
						firstCurrency={this.props.firstCurrency}
						secondCurrency={this.props.secondCurrency}
						currencyPair={this.props.currencyPair}
						firstCurrencyBalance={this.props.firstCurrencyBalance}
						secondCurrencyBalance={this.props.secondCurrencyBalance}
						autoHeightMin={350}
						autoHeightMax={350}
						setBuyOrders={this.setBuyOrders}
						setSellOrders={this.setSellOrders}
						hubConnection={this.props.hubConnection}
						sellerOrder={this.state.sellerOrder}
						bulkOrder={this.props.bulkOrder}
						sellerOrderList={this.state.tempSellOrders}
						exchangeList={exchangeList}
					/>
				</div>
				<div className="w-20 buy_sell_form pr-0 pl-0">
					<BuySellForm
						{...this.props}
						info={this.props}
						firstCurrency={this.props.firstCurrency}
						secondCurrency={this.props.secondCurrency}
						currencyPair={this.props.currencyPair}
						currencyPairID={this.props.currencyPairID}
						state={this.props.state}
						buyPrice={this.props.currentBuyPrice}
						sellPrice={this.props.currentSellPrice}
						firstCurrencyBalance={this.props.firstCurrencyBalance}
						secondCurrencyBalance={this.props.secondCurrencyBalance}
						bulkBuyOrder={this.props.bulkBuyOrder}
						bulkSellOrder={this.props.bulkSellOrder}
						isBulkSellOrder={this.props.isBulkSellOrder}
						isBulkBuyOrder={this.props.isBulkBuyOrder}
						hubConnection={this.props.hubConnection}
						firstCurrencyWalletId={this.props.firstCurrencyWalletId}
						secondCurrencyWalletId={this.props.secondCurrencyWalletId}
						takers={this.props.takersValue}
						makers={this.props.makersValue}
						isBothOrder={this.props.isBothOrder}
						ClearAllFields={this.ClearAllFields}
					/>
				</div>
				<div className="w-40 buy_book pr-0 pl-0">
					<BuyTrade
						{...this.props}
						firstCurrency={this.props.firstCurrency}
						UpDownBit={this.props.UpDownBit}
						secondCurrency={this.props.secondCurrency}
						currencyPair={this.props.currencyPair}
						firstCurrencyBalance={this.props.firstCurrencyBalance}
						secondCurrencyBalance={this.props.secondCurrencyBalance}
						hubConnection={this.props.hubConnection}
						autoHeightMin={350}
						autoHeightMax={350}
						setSellOrders={this.setSellOrders}
						buyerOrder={this.state.buyerOrder}
						buyerOrderList={this.state.tempBuyOrders}
						exchangeList={exchangeList}
					/>
				</div>

			</div>
		);
	}
}

// Set Props when actions are dispatch
const mapStateToProps = ({ buyerOrder, sellerOrder, arbitrageOrderBook, settings, currentMarketCap }) => {
	return {
		arbitrageBuyerOrder: arbitrageOrderBook.arbitrageBuyerOrder,
		arbitrageSellerOrder: arbitrageOrderBook.arbitrageSellerOrder,
		arbitrageBuyerOrderBit: arbitrageOrderBook.arbitrageBuyerOrderBit,
		arbitrageSellerOrderBit: arbitrageOrderBook.arbitrageSellerOrderBit,

		sellerBookLoader: arbitrageOrderBook.sellerOrderLoading,
		darkMode: settings.darkMode,
		currentMarketCap: currentMarketCap.currentMarketCap,

		buyerOrder: buyerOrder.buyerOrder,
		sellerOrder: sellerOrder.sellerOrder,
		buyerOrderBit: buyerOrder.buyerOrderBit,
		sellerOrderBit: sellerOrder.sellerOrderBit,
	};

}

export default connect(mapStateToProps, {
	atbitrageSellerBook,
	atbitrageBuyerBook,
})(BuySellTrade);