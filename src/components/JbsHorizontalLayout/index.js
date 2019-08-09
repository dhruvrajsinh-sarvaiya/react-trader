/**
 * Jbs Trading Menu Layout
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'react-redux';
import $ from 'jquery';

// Components
import Header from 'Components/Header/Header';
import Header1 from 'Components/LandingCooldex/components/header1';
import Footer from 'Components/Footer/Footer';
import CooldexFooter from 'Components/Footer/CooldexFooter';
//import HorizontalMenu from 'Components/HorizontalMenu/HorizontalMenu';
import TradingMenu from 'Components/TradingMenu/HorizontalMenu';
//import ThemeOptions from 'Components/ThemeOptions/ThemeOptions';
import Tour from 'Components/Tour';

// app config
import AppConfig from 'Constants/AppConfig';

// actions
import { startUserTour } from 'Actions';

// code for import necessary module for SignalR connectivity, code added by devang parekh 15-11-2018
import { NotificationManager } from "react-notifications";
import IntlMessages from "Util/IntlMessages";

// for handling session expired added by devang parekh
import { redirectToLogin } from 'Helpers/helpers';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Slide from '@material-ui/core/Slide';

const signalR = require("@aspnet/signalr");
const signalRURL = AppConfig.signalRURL
// end

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class JbsHorizontalLayout extends Component {
    
    constructor(props){
        super(props);
    
        try {

            this.state = {
                height_style: {
                    minHeight:0
                },
                // signalr Connection
                hubConnection: new signalR.HubConnectionBuilder().withUrl(signalRURL).configureLogging(signalR.LogLevel.None).build(),
                redirectToLogin:false,
                isSiteUnderMaintenance:false,
            }

        } catch(e) {
            //console.log("Connection Initialize error",e)
        }

        window.JbsHorizontalLayout = this;
        //console.log(window.JbsHorizontalLayout);
    }

    reRefreshTokenSignalR() {
        //console.log("props",window.JbsHorizontalLayout.props);
        try {

            window.JbsHorizontalLayout.state.hubConnection.serverTimeoutInMilliseconds = 24 * 60 * 60 * 1000; // hour * minute * seconds * ms
            if(window.JbsHorizontalLayout.state.hubConnection.connection.connectionState !== 1 ) {

                //console.log("Start Connection",(new Date()));
                window.JbsHorizontalLayout.state.hubConnection.start().then(() => {
                    //console.log("Hub Connection",window.JbsHorizontalLayout.state.hubConnection);
                    //console.log("end connection",(new Date()));
                    //window.JbsHorizontalLayout.state.hubConnection.invoke('OnConnected', localStorage.getItem('gen_access_token')).catch(err => console.error("Subscribe Error",err));
                    window.JbsHorizontalLayout.state.hubConnection.invoke('OnConnected', localStorage.getItem('gen_refresh_token')).catch(err => console.error("Subscribe Error",err));

                    window.JbsHorizontalLayout.setState({hubConnection:window.JbsHorizontalLayout.state.hubConnection});

                });

            } else {
                //window.JbsHorizontalLayout.state.hubConnection.invoke('OnTokenChange', localStorage.getItem('gen_access_token')).catch(err => console.error("Token Change",err))
            }
            
        } catch(error) {
            //console.log("error in refreshtoken",error)
        }
        
    }
       
    connectSignalR(Pair = '',BasedCurrency = '') {
        //console.log("connectSignalR : ")
        window.JbsHorizontalLayout.state.hubConnection.serverTimeoutInMilliseconds = 24 * 60 * 60 * 1000; // hour * minute * seconds * ms
        
        if(window.JbsHorizontalLayout.state.hubConnection.connection.connectionState !== 1 ) {

            try {

                //console.log("Start Connection",(new Date()));
                window.JbsHorizontalLayout.state.hubConnection.start().then(() => {
                    //console.log("Hub Connection",window.JbsHorizontalLayout.state.hubConnection);
                    //console.log("end connection",(new Date()));
                    //window.JbsHorizontalLayout.state.hubConnection.invoke('OnConnected', localStorage.getItem('gen_access_token')).catch(err => console.error("Subscribe Error",err));
                    window.JbsHorizontalLayout.state.hubConnection.invoke('OnConnected', localStorage.getItem('gen_refresh_token')).catch(err => console.error("Subscribe Error",err));

                    window.JbsHorizontalLayout.setState({hubConnection:window.JbsHorizontalLayout.state.hubConnection});

                    if(Pair !== '' && BasedCurrency !== '') {
                        window.JbsHorizontalLayout.state.hubConnection.invoke('AddPairSubscription',Pair,AppConfig.defaultPair).catch(err => console.error("AddPairSubscription",err));
                        window.JbsHorizontalLayout.state.hubConnection.invoke('AddMarketSubscription',BasedCurrency,AppConfig.defaultBasedCurrency).catch(err => console.error("AddMarketSubscription",err));
                    }

                    if(Pair !== '' && BasedCurrency !== '') {
                        window.JbsHorizontalLayout.state.hubConnection.invoke('AddArbitragePairSubscription',Pair,AppConfig.defaultPair).catch(err => console.error("AddPairSubscription",err));
                        window.JbsHorizontalLayout.state.hubConnection.invoke('AddArbitrageMarketSubscription',BasedCurrency,AppConfig.defaultBasedCurrency).catch(err => console.error("AddMarketSubscription",err));
                    }

                    window.JbsHorizontalLayout.state.hubConnection.on("RecieveNotification",(notificationDetail) => {
                        
                        //console.log("Get Data from signalR RecieveNotification", notificationDetail);
                        try {

                            notificationDetail = JSON.parse(notificationDetail);
                            if(typeof notificationDetail.Data !== 'undefined' && notificationDetail.Data !== '') {
                                
                                Object.keys(notificationDetail.Data).forEach(function(key) {

                                    if( notificationDetail.Data[key] !== null && notificationDetail.Data[key].toString().indexOf('.') !== -1) {
                                        notificationDetail.Data[key] = /^(([0-9]{1,})(\.[0-9]{1,8})?)/.exec(notificationDetail.Data[key])[0];
                                    }

                                    if (notificationDetail.Data[key] === 0) {
                                        notificationDetail.Data[key] = 'Market'
                                    }
                                    
                                });

                                //console.log("activityNotification.message."+notificationDetail.Data.MsgCode);
                                if(notificationDetail.Data.Type === 1) {
                                    NotificationManager.success(<IntlMessages id={`activityNotification.message.${notificationDetail.Data.MsgCode}`} values={notificationDetail.Data} />);
                                } else if(notificationDetail.Data.Type === 2) {
                                    NotificationManager.error(<IntlMessages id={`activityNotification.message.${notificationDetail.Data.MsgCode}`} values={notificationDetail.Data} />);
                                } else if(notificationDetail.Data.Type === 3) {
                                    NotificationManager.info(<IntlMessages id={`activityNotification.message.${notificationDetail.Data.MsgCode}`} values={notificationDetail.Data} />);
                                }

                            }
                            
                            
                        } catch(error) {

                        }
                        
                    });

                    window.JbsHorizontalLayout.state.hubConnection.on("RecieveNotificationArbitrage",(notificationDetail) => {
                        
                        //console.log("Get Data from signalR RecieveNotificationArbitrage", notificationDetail);
                        try {

                            notificationDetail = JSON.parse(notificationDetail);

                            if(typeof notificationDetail.Data !== 'undefined' && notificationDetail.Data !== '') {
                                
                                
                                Object.keys(notificationDetail.Data).forEach(function(key) {

                                    if( notificationDetail.Data[key] !== null && notificationDetail.Data[key].toString().indexOf('.') !== -1) {
                                        notificationDetail.Data[key] = /^(([0-9]{1,})(\.[0-9]{1,8})?)/.exec(notificationDetail.Data[key])[0];
                                    }

                                    if (notificationDetail.Data[key] === 0) {
                                        notificationDetail.Data[key] = 'Market'
                                    }
                                    
                                });

                                //console.log("activityNotification.message."+notificationDetail.Data.MsgCode);
                                if(notificationDetail.Data.Type === 1) {
                                    NotificationManager.success(<IntlMessages id={`activityNotification.message.${notificationDetail.Data.MsgCode}`} values={notificationDetail.Data} />);
                                } else if(notificationDetail.Data.Type === 2) {
                                    NotificationManager.error(<IntlMessages id={`activityNotification.message.${notificationDetail.Data.MsgCode}`} values={notificationDetail.Data} />);
                                } else if(notificationDetail.Data.Type === 3) {
                                    NotificationManager.info(<IntlMessages id={`activityNotification.message.${notificationDetail.Data.MsgCode}`} values={notificationDetail.Data} />);
                                }else{
                                    
                                }

                            }
                            
                            
                        } catch(error) {
                            //console.log("erroir:",error)
                        }
                        
                    });

                    window.JbsHorizontalLayout.state.hubConnection.on("ReceiveSessionExpired",(notificationDetail) => {
                        
                        //console.log("Get Data from signalR ReceiveSessionExpired", notificationDetail);
                        try {

                            notificationDetail = JSON.parse(notificationDetail);
                            if(typeof notificationDetail.Data !== 'undefined' && notificationDetail.Data !== '') {
                                //NotificationManager.error(<IntlMessages id={`activityNotification.message.${notificationDetail.Data.MsgCode}`} values={notificationDetail.Data} />);
                            }
                            
                            this.setState({redirectToLogin:true});

                        } catch(error) {
                            
                        }
                        
                        setTimeout(function(){
                            redirectToLogin();
                        },5000)

                    });

                    // code added by devang parekh for handling site under maintenance (15-3-2019)
                    window.JbsHorizontalLayout.state.hubConnection.on("ReceiveEnvironmentMode",(environmentDetail) => {
                        
                        //console.log("Get Data from signalR ReceiveEnvironmentMode", environmentDetail);
                        try {

                            environmentDetail = JSON.parse(environmentDetail);
                            
                            if(typeof environmentDetail.Data !== 'undefined' && environmentDetail.Data !== '') {
                                
                                if(typeof environmentDetail.Data.MsgCode !== 'undefined' && parseInt(environmentDetail.Data.MsgCode) === 6062 ) { // MsgCode => 6062 : under maintance, 6063 : for live 
                                    this.setState({isSiteUnderMaintenance:true});
                                } else {
                                    this.setState({isSiteUnderMaintenance:false});
                                }
                                //NotificationManager.error(<IntlMessages id={`ectivityEnvironment.message.${environmentDetail.Data.MsgCode}`} values={environmentDetail.Data} />);
                            }
                            
                        } catch(error) {
                            console.log("error",error)
                        }
                        
                        setTimeout(function(){
                            window.location.href = '/';
                        },5000)

                    });
                    //end

                });
                
            } catch(e) {
                console.log("Start Connection error",e)
            }

        } else {

            //console.log("already have Connection",(new Date()));

            window.JbsHorizontalLayout.state.hubConnection.invoke('OnConnected', localStorage.getItem('gen_refresh_token')).catch(err => console.error("Subscribe Error",err));

            window.JbsHorizontalLayout.setState({hubConnection:window.JbsHorizontalLayout.state.hubConnection});

            if(Pair !== '' && BasedCurrency !== '') {
                window.JbsHorizontalLayout.state.hubConnection.invoke('AddPairSubscription',Pair,AppConfig.defaultPair).catch(err => console.error("AddPairSubscription",err));
                window.JbsHorizontalLayout.state.hubConnection.invoke('AddMarketSubscription',BasedCurrency,AppConfig.defaultBasedCurrency).catch(err => console.error("AddMarketSubscription",err));
            }

            if(Pair !== '' && BasedCurrency !== '') {
                window.JbsHorizontalLayout.state.hubConnection.invoke('AddArbitragePairSubscription',Pair,AppConfig.defaultPair).catch(err => console.error("AddPairSubscription",err));
                window.JbsHorizontalLayout.state.hubConnection.invoke('AddArbitrageMarketSubscription',BasedCurrency,AppConfig.defaultBasedCurrency).catch(err => console.error("AddMarketSubscription",err));
            }

        }

    }

    componentWillMount() {

        this.connectSignalR();
        this.updateDimensions();
    }

    componentDidMount() {
        const { windowWidth } = this.state;
        window.addEventListener("resize", this.updateDimensions);
        if (AppConfig.enableUserTour && windowWidth > 600) {
            setTimeout(() => {
                this.props.startUserTour();
            }, 2000);
        }
        //added dynamic height for footer by screen resolution wise set
        var xyz = $(".jbs-page-content").height();
        //console.log("xyz",xyz);
        xyz = 72+xyz+33;
        //console.log("xyz",xyz);
        if(xyz<$(window).height()){
            xyz=($(window).height()-xyz);
            //console.log("xyz",xyz);
            this.setState({height_style : {minHeight:(xyz)+"px"}});        
        }
        //console.log($(window).height());
    } 
 

    updateDimensions = () => {
        this.setState({ windowWidth: $(window).width(), windowHeight: $(window).height() });
    }

    renderPage() {

        const { pathname } = this.props.location;
        const { children, match } = this.props;
        const mystyle = this.state.height_style;
        //console.log("mystyle",mystyle);
        //console.log(pathname);
        
        this.props.location.state = { ...this.props.location.state,hubConnection : this.state.hubConnection,connectSignalR:this.connectSignalR};
        
        if (pathname === `${match.url}/chat` || pathname.startsWith(`${match.url}/mail`) || pathname === `${match.url}/todo`) {
            return (
                <div className="jbs-page-content p-0" >
                    {children}
                </div>
            );
        }
        return (
            <Scrollbars
                className="jbs-scroll"
                autoHide
                autoHideDuration={100}
                style={{ height: 'calc(100vh - 100px)' }}
            >
                <div className="jbs-page-content tradingdashboard" style={mystyle}>
                    {children}
                </div>
                {/* {this.props.location.pathname === '/app/dashboard/CooldexTrading' ? <CooldexFooter/> :  <Footer />} */}
                <CooldexFooter/>
                
                { this.state.redirectToLogin && <Dialog
                    open={this.state.redirectToLogin}
                    TransitionComponent={Transition}
                    keepMounted
                    //onClose={this.handleNoWalletConfirmation}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    {<DialogTitle id="alert-dialog-slide-title">
                        <strong>{<IntlMessages id="wallet.DWTableInfo" />}</strong>
                    </DialogTitle>}
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            <strong>{<IntlMessages id="activityNotification.message.6046" />}</strong>
                        </DialogContentText>
                    </DialogContent>
                    {/* <DialogActions>
                        <Button variant="raised" onClick={(e) => this.handleNoWalletConfirmation(e)} className="btn-success text-white mr-10">{<IntlMessages id="wallet.AGDialogButtonAgree" />}</Button>
                    </DialogActions> */}
                </Dialog>}

                { this.state.isSiteUnderMaintenance && <Dialog
                    open={this.state.isSiteUnderMaintenance}
                    TransitionComponent={Transition}
                    keepMounted
                    //onClose={this.handleNoWalletConfirmation}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    {<DialogTitle id="alert-dialog-slide-title">
                        <strong>{<IntlMessages id="wallet.DWTableInfo" />}</strong>
                    </DialogTitle>}
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            <strong>{<IntlMessages id="activityNotification.message.6062" />}</strong>
                        </DialogContentText>
                    </DialogContent>
                    {/* <DialogActions>
                        <Button variant="raised" onClick={(e) => this.handleNoWalletConfirmation(e)} className="btn-success text-white mr-10">{<IntlMessages id="wallet.AGDialogButtonAgree" />}</Button>
                    </DialogActions> */}
                </Dialog>}

            </Scrollbars>
            
        );
    }

    render() {
        return (
            <div className="app-horizontal collapsed-sidebar">
                <div className="app-container">
                <Tour />
                    <div className="jbs-page-wrapper">
                        <div className="jbs-app-content">
                            <div className="app-header  cooldex-header">
                                {/* //{this.props.location.pathname === '/app/dashboard/CooldexTrading' ? "app-header  cooldex-header" : "app-header"}> */}
                                {/* For Load Diffrent Header without login and Withlogin  */}
                                {/* <Header tradingMenu /> */}
                                {localStorage.getItem('gen_access_token') && localStorage.getItem('gen_id_token') && localStorage.getItem('gen_refresh_token') && localStorage.getItem('gen_access_token') != '' && localStorage.getItem('gen_id_token') != '' && localStorage.getItem('gen_refresh_token') !='' ? <Header tradingMenu /> : <Header1 />}
                                {/* <Header tradingMenu /> */}
                                
                                {/* <Header1 /> */}
                            </div>
                            <div className="jbs-page">
                            
                            {/* <TradingMenu classnames="trading-menu cooldextrading-menu"></TradingMenu> */}
                                {localStorage.getItem('gen_access_token') && localStorage.getItem('gen_id_token') && localStorage.getItem('gen_refresh_token') && localStorage.getItem('gen_access_token') != '' && localStorage.getItem('gen_id_token') != '' && localStorage.getItem('gen_refresh_token') !='' ? <TradingMenu classnames="trading-menu cooldextrading-menu"></TradingMenu> : ''}
                                
                                {/* // {this.props.location.pathname === '/app/dashboard/CooldexTrading' ? 'trading-menu cooldextrading-menu':'trading-menu'}/> */}
                                {this.renderPage()}
                            </div>
                            {/* <ThemeOptions /> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}



// map state to props
const mapStateToProps = () => {
    return { }
}

export default withRouter(connect(mapStateToProps, {
    startUserTour
})(JbsHorizontalLayout));