/**
 * Author : Tejas Gauswami
 * Created : 3/06/2019
 *  Arbitrage Buy order book component..
*/

// import scrollbar
import React, { Fragment, Component } from "react";

//used for connect to store
import { connect } from "react-redux";

//used for display scroll bar
import { Scrollbars } from "react-custom-scrollbars";

//used for design
import { Table, Button } from "reactstrap";

// used for loader 
import JbsLoader from "Components/JbsPageLoader/JbsLoader";

// used static constants for app
import AppConfig from 'Constants/AppConfig';

//used for jquery
import $ from 'jquery';

// import check box and labels
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

//used multiple classes with condition 
import classnames from 'classnames';

// used for convert messages in different langauages
import IntlMessages from "Util/IntlMessages";
const buySellRecordCount = 14//AppConfig.buySellRecordCount;

// class fro set row
class BuyOrderRow extends Component {

	//set record for place order
	SetPlaceOrder = (key, isMultiple) => {
		if (key < 999) {
			this.props.setOrders(key, isMultiple);
		}
	}

	//renders the component
	render() {

		var lastClass = "text-success price-data",
			changeClass = "";

		return (
			<tr
			key={(((this.props.indexValue+1)*10)+(Math.random()*Math.random()*Math.random())).toString()}
				style={{
					background: this.props.bgColorData,
				}}
				//className={(this.props.UpDownBit === 1) ? changeClass + " buyOrderClass" : ''}
				className={(this.props.OldLTP !== undefined && this.props.Price !== this.props.OldLTP) ? "blink_me buyOrderClass" : 'buyOrderClass'}
			>


				<td className="askBidbtn">
					{this.props.Price !== '-' ?
					// <a href="javascript:void(0)" onClick={() => this.SetPlaceOrder(this.props.indexValue, undefined)}>
					<a href="javascript:void(0)" onClick={() => this.props.changeSelectedBuyValue(25, this.props.order, !this.props.isMultiSelect)}>
					<IntlMessages id="trading.placeorder.label.sell" />
				</a>
					:
					"-"
					}
				</td>
				<td className={lastClass}>{this.props.Price !== '-' ? parseFloat(this.props.Price).toFixed(this.props.priceLength) : '-'}</td>
				<td className="calculate-btns">
				{this.props.Price !== '-' ?
					<div className="d-flex">
						<Button
							value="25"
							className={classnames(
								{ active: (this.props.selectedBuyValue === 25 && this.props.isMultiSelect) },
								"btnsell-per-arbitrage btn-xs w-25"
							)}
							onClick={event => {
								this.props.changeSelectedBuyValue(25, this.props.order, true);
							}}
						>
							25%
					</Button>

						<Button
							value="50"
							className={classnames(
								{ active: (this.props.selectedBuyValue === 50 && this.props.isMultiSelect) },
								"btnsell-per-arbitrage btn-xs w-25"
							)}
							onClick={event => {
								this.props.changeSelectedBuyValue(50, this.props.order, true);
							}}
						>
							50%
                  </Button>

						<Button
							value="75"
							className={classnames(
								{ active: (this.props.selectedBuyValue === 75 && this.props.isMultiSelect) },
								"btnsell-per-arbitrage btn-xs w-25"
							)}
							onClick={event => {
								this.props.changeSelectedBuyValue(75, this.props.order, true);
							}}
						>
							75%
                  </Button>

						<Button
							value="100"
							className={classnames(
								{ active: (this.props.selectedBuyValue === 100 && this.props.isMultiSelect) },
								"btnsell-per-arbitrage btn-xs w-25"
							)}
							onClick={event => {
								this.props.changeSelectedBuyValue(100, this.props.order, true);
							}}
						>
							100%
                  </Button>

					</div>
				:
				"-"
			}
			</td>
				{/* <td className="price-data">
				{this.props.Price !== '-' ?
					parseFloat(this.props.buyFees)
					:
					"-"
				}
				</td> */}

				<td className="exchange-name">{this.props.exchangeName ? this.props.exchangeName : "-"}</td>
				{<td className="lbl-data askBidbtn" style={{ width: "10% !important" }}>
				{this.props.Price !== '-' ?
					<FormControlLabel
					className="check_btn"
						control={
							<Checkbox
								checked={this.props.isMultiSelect === true}
								onChange={() => this.props.changeSelectedBuyValue(25, this.props.order, !this.props.isMultiSelect)}
								icon={<CheckBoxOutlineBlankIcon />}
								checkedIcon={<CheckBoxIcon />}
							/>
						}

					/>
					:
				"-"
					}
				</td>}

			</tr>
		);		
	}
}

// class for buytrade table
class BuyTrade extends Component {
	constructor(props) {
		super(props);
		this.state = {
			buyerOrderList: this.props.buyerOrderList.length ? this.props.buyerOrderList : [],
			selectedBuyValue: 0
		};
		this.isComponentActive = 1;
	}

	//set selected buy Value
	changeSelectedBuyValue = (value, data, isMultiSelect) => {

		var total = "", amount = "";
		var LpType = data.LPType;
		if (this.state.selectedBuyValue === value) {

		} else {

			// calculation process of Amount
			if (data.LTP !== "") {

				amount = parseFloat(
					parseFloat(
						parseFloat(this.props.firstCurrencyBalance) * parseFloat(value)
					) / 100
				).toFixed(8);
				total = parseFloat(
					parseFloat(
						parseFloat(data.LTP) * parseFloat(amount)
					) / 100
				).toFixed(8);

				this.props.setSellOrders(data.LTP, amount, isMultiSelect, LpType, total, value, data)

			}
		}


	};

	//Open Modal add new Schedule dailog
	setOrders = (index, isMultiple) => {

		var amount = 0;
		var price = 0;
		var LpType = "";
		var data=[]

		if (this.props.buyerOrderList.length !== 0) {
			this.props.buyerOrderList.map((value, key) => {

				if (index === key) {
					price = value.LTP;
					LpType = value.LPType;
					data = value
				}
				//return null

			});
		}

		this.props.setSellOrders(price, amount, isMultiple, LpType,undefined , undefined,data)
	}

	componentWillUnmount() {
		this.isComponentActive = 0;
	}

	// change background color of row as per records
	LightenDarkenColor = (col, amt) => {

		var usePound = false;

		if (col[0] === "#") {
			col = col.slice(1);
			usePound = true;
		}

		var num = parseInt(col, 16);

		var r = (num >> 16) + amt;

		if (r > 255) r = 255;
		else if (r < 0) r = 0;

		var b = ((num >> 8) & 0x00FF) + amt;

		if (b > 255) b = 255;
		else if (b < 0) b = 0;

		var g = (num & 0x0000FF) + amt;

		if (g > 255) g = 255;
		else if (g < 0) g = 0;

		return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

	}

	// Render Component for Buyer Order
	render() {

		var {buyerOrderList,exchangeList} = this.props;

		buyerOrderList.map((exchange,index) => {
			if(exchangeList[exchange.ProviderName.toLowerCase()] && exchangeList[exchange.ProviderName.toLowerCase()].LTP && exchangeList[exchange.ProviderName.toLowerCase()].OldLTP) {
				buyerOrderList[index].OldLTP = exchangeList[exchange.ProviderName.toLowerCase()].OldLTP;
				buyerOrderList[index].LTP = exchangeList[exchange.ProviderName.toLowerCase()].LTP;
			}						
		})

		buyerOrderList.sort(function (a, b) {
			return parseFloat(b.LTP) - parseFloat(a.LTP)
		})

		var colData = "";
		$(".buyOrderClass").removeClass('blink_me');
		const diffLimit = buySellRecordCount - buyerOrderList.length;
		var buyOrderList = [];
		var keyIndex = 0;

		buyerOrderList.map((newBuyOrder, indexValue) => {

			buyOrderList.push(
				keyIndex <= 8 ?
					<BuyOrderRow
				exchangeName={newBuyOrder.ProviderName}
				key={indexValue}
				Price={newBuyOrder.LTP}
				Fees={newBuyOrder.Fees}
				setOrders={this.setOrders}
				isMultiSelect={newBuyOrder.isMultiSelect}
				indexValue={indexValue}
				//UpDownBit={newBuyOrder.UpDownBit}
				OldLTP={newBuyOrder.OldLTP}
				bgColorData={colData !== "" ? colData = this.LightenDarkenColor(colData, 20)
					: colData = this.LightenDarkenColor("#FF0000", 20)
				}
				amount_size={newBuyOrder.amount_size}
				order={newBuyOrder}
				priceLength={this.props.priceLength}
				buyFees={this.props.buyFees}
				changeSelectedBuyValue={this.changeSelectedBuyValue}
				selectedBuyValue={(newBuyOrder.checkedBtn === undefined || newBuyOrder.checkedBtn === 0) ? 25 : newBuyOrder.checkedBtn}
				/>
				:
				<BuyOrderRow
					exchangeName={newBuyOrder.ProviderName}
					key={indexValue}
					Price={newBuyOrder.LTP}
					Fees={newBuyOrder.Fees}
					setOrders={this.setOrders}
					isMultiSelect={newBuyOrder.isMultiSelect}
					indexValue={indexValue}
					priceLength={this.props.priceLength}
					buyFees={this.props.buyFees}
					//UpDownBit={newBuyOrder.UpDownBit}
					OldLTP={newBuyOrder.OldLTP}
					bgColorData={colData !== "" ? colData = this.LightenDarkenColor(colData, -20)
						: colData = this.LightenDarkenColor("#FF0000", -20)
					}
					amount_size={newBuyOrder.amount_size}
					order={newBuyOrder}
					changeSelectedBuyValue={this.changeSelectedBuyValue}
					selectedBuyValue={(newBuyOrder.checkedBtn === undefined || newBuyOrder.checkedBtn === 0) ? 25 : newBuyOrder.checkedBtn}
				/>
				);
				keyIndex = keyIndex + 1;
			//return null
		});

		if (diffLimit <= buySellRecordCount) {
			for (var lastIndex = buyerOrderList.length; lastIndex < buySellRecordCount; lastIndex++) {
				keyIndex <= 8 ?

				buyOrderList.push(<BuyOrderRow
					exchangeName=""
					key={lastIndex}
					Price={"-"}
					Amount={"-"}
					setOrders={this.setOrders}
					indexValue={lastIndex}
					priceLength={this.props.priceLength}
					buyFees={this.props.buyFees}
					UpDownBit={0}
					bgColorData={colData !== "" ? colData = this.LightenDarkenColor(colData, 20)
					: colData = this.LightenDarkenColor("#FF0000", 20)
				}

				/>)
				:
				buyOrderList.push(<BuyOrderRow
					exchangeName=""
					key={lastIndex}
					Price={"-"}
					Amount={"-"}
					priceLength={this.props.priceLength}
					buyFees={this.props.buyFees}
					setOrders={this.setOrders}
					indexValue={lastIndex}
					UpDownBit={0}
					bgColorData={colData !== "" ? colData = this.LightenDarkenColor(colData, -20)
					: colData = this.LightenDarkenColor("#FF0000", -20)
				}

				/>)
				keyIndex = keyIndex + 1;
			}
		}

		return (
			<Fragment >

				<Table className="table m-0 p-0 buy-table">

					<thead>
						<tr className="text-light">

							<th className="numeric askBidbtn">
								<IntlMessages id="sidebar.arbitrageBid" />
							</th>
							<th className="numeric price-data">
								<IntlMessages id="sidebar.arbitrageRate" />
							</th>
							<th className="numeric calculate-btns">
								<IntlMessages id="trading.orders.label.amount" />
							</th>
								{/* <th className="numeric price-data">
								<IntlMessages id="sidebar.fees" />(%)
							</th> */}
							<th className="exchange-name">
								<IntlMessages id="sidebar.arbitrageExchangeName" />
							</th>
							{<th className="askBidbtn"></th>}
						</tr>
					</thead>
				</Table>


				<Scrollbars
					className="jbs-scroll"
					autoHeight
					autoHeightMin={this.props.autoHeightMin}
					autoHeightMax={this.props.autoHeightMax}
					autoHide
				>
					{this.props.buyerOrderLoading && <JbsLoader />}
					<Table className="table m-0 p-0 buy-table">
						{buyOrderList && buyOrderList.length ?
							<tbody>

								{buyOrderList}

							</tbody>
							:
							<tbody>
								<tr>
									<td>
										<IntlMessages id="apiErrCode.31020" />
									</td>
								</tr>
							</tbody>
						}
					</Table>
				</Scrollbars>

			</Fragment>
		);
	}
}

const mapStateToProps = ({  arbitrageOrderBook }) => {

	return {
		buyerOrderLoading: arbitrageOrderBook.buyerOrderLoading,
	};

}

// connect action with store for dispatch
export default connect(mapStateToProps, {})(BuyTrade);