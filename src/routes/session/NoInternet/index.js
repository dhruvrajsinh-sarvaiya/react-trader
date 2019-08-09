import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Link } from 'react-router-dom';
import QueueAnim from 'rc-queue-anim';

export default class NotFound extends Component {
  render() {
    return (
      <QueueAnim type="bottom" duration={2000}>
        <div className="error-wrapper" key="1">
          <AppBar position="static" className="session-header">
            <Toolbar>
              <div className="container">
                <div className="d-flex justify-content-between">
                  <div className="session-logo">
                    <Link to="/">
                      <img src={require('Assets/img/biztech.png')} alt="session-logo" className="img-fluid" width="110" height="35" />
                    </Link>
                  </div>
                </div>
              </div>
            </Toolbar>
          </AppBar>
          <div className="session-inner-wrapper">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-9 mx-auto">
                <div className="error-body text-center">
                  <h2 className="oops">Oops.. </h2>
                  <h2 className="bold mb-0"><i className="zmdi zmdi-wifi-off"></i></h2>
                  <h2 className="error-msg mb-30">There is not Internet Connection</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </QueueAnim>
    );
  }
}
