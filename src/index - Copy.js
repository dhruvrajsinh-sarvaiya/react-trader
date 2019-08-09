/**
 * Auther : Salim Deraiya
 * Created : 27/05/2019
 * updated by :
 * Arbitrage Routes..
 */
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import ArbitrageDashboard from "./dashboard";

const Arbitrage = ({ match }) => (
    <div className="dashboard-wrapper">
        <Switch>
            <Redirect exact from={`${match.url}/arbitrage`} to={`${match.url}`} />
            <Route path={`${match.url}/dashboard`} component={ArbitrageDashboard} />
        </Switch>
    </div>
);

export default Arbitrage;