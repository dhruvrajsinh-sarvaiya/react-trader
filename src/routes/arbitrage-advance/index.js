/**
 * Auther : Devang Parekh
 * Created : 22/07/2019
 * Arbitrage Advance with socket Routes..
 * 
 */
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import ArbitrageDashboard from "./dashboard";
import ProfitIndicatorRoute from "./profitIndicator";
import ArbitrageTrading from './ArbitrageTrading';

const Arbitrage = ({ match }) => (
    <div className="dashboard-wrapper">
        <Switch>
            <Redirect exact from={`${match.url}/arbitrage-advance`} to={`${match.url}`} />
            <Route path={`${match.url}/dashboard`} component={ArbitrageDashboard} />
            <Route path={`${match.url}/trading`} component={ArbitrageTrading} />
            <Route path={`${match.url}/profit-indicator`} component={ProfitIndicatorRoute} />
        </Switch>
    </div>
);

export default Arbitrage;