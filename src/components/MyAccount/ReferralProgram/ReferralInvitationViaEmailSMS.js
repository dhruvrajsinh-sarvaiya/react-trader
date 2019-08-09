/**
 * Created By Sanjay 
 * Created Date 26/02/19
 * Component For Report Of Referral Invitation Via Email and SMS
 */
import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";
import MUIDataTable from "mui-datatables";
import IntlMessages from "Util/IntlMessages";
import { Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import JbsCollapsibleCard from 'Components/JbsCollapsibleCard/JbsCollapsibleCard';
import { CustomFooter } from '../Widgets';
import JbsSectionLoader from "Components/JbsSectionLoader/JbsSectionLoader";
import { changeDateFormat } from "Helpers/helpers";
import AppConfig from 'Constants/AppConfig';
import { getReferralInviteByChannel, getPayType, getServiceList } from 'Actions/MyAccount';
//for Validation
import validateReferralProgram from '../../../validation/MyAccount/referral_program';
//Added By Tejas For Display Error Message 26/3/2019
import { NotificationManager } from 'react-notifications';

//Columns Object
const columns = [
  {
    name: <IntlMessages id="sidebar.colHash" />,
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: <IntlMessages id="sidebar.colUserName" />,
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: <IntlMessages id="sidebar.colChannelType" />,
    options: {
      filter: false,
      sort: false
    }
  },
  {
    name: <IntlMessages id="sidebar.colPayType" />,
    options: {
      filter: false,
      sort: false
    }
  },
  {
    name: <IntlMessages id="table.Discription" />,
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: <IntlMessages id="sidebar.Receiver" />,
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: <IntlMessages id="sidebar.colCreatedDt" />,
    options: {
      filter: false,
      sort: false,
    }
  }
];

class ReferralInvitationViaEmailSMS extends Component {
  state = {
    Data: [],
    getFilter: {
      PageIndex: 1,
      Page_Size: AppConfig.totalRecordDisplayInList,
      FromDate: "",
      ToDate: "",
      PayType: "",
      Service: "",
      channelId: "",
    },
    totalCount: 0,
    payTypeList: [],
    serviceData: [],
    showReset: false,
    errors: {}
  }
  clearFilter = () => {
    let today = new Date();
    today = today.getFullYear() + '-' + ((today.getMonth() + 1) < 10 ? '0' : '') + (today.getMonth() + 1) + '-' + (today.getDate() < 10 ? '0' : '') + today.getDate();
    var newObj = Object.assign({}, this.state.getFilter);
    newObj.FromDate = today;
    newObj.ToDate = today;
    newObj.PageIndex = 1;
    newObj.Page_Size = AppConfig.totalRecordDisplayInList;
    newObj.PayType = "";
    newObj.Service = "";
    newObj.channelId = this.state.getFilter.channelId;
    this.setState({ showReset: false, getFilter: newObj, errors: {} });
    this.props.getReferralInviteByChannel(newObj);
  }
  componentWillMount() {
    let today = new Date();
    today = today.getFullYear() + '-' + ((today.getMonth() + 1) < 10 ? '0' : '') + (today.getMonth() + 1) + '-' + (today.getDate() < 10 ? '0' : '') + today.getDate();
    var newObj = Object.assign({}, this.state.getFilter);
    newObj.FromDate = today;
    newObj.ToDate = today;
    newObj.PageIndex = 1;
    newObj.Page_Size = AppConfig.totalRecordDisplayInList;
    newObj.channelId = this.props.channelId;
    this.setState({ getFilter: newObj });
    this.props.getReferralInviteByChannel(newObj);
    this.props.getPayType();
    this.props.getServiceList({ PayTypeId: 0 });
  }
  getFilterData = () => {

    //Added by Saloni 
    var newObj = Object.assign({}, this.state.getFilter);
    const { isValid, errors } = validateReferralProgram(newObj);
    this.setState({ errors: errors })
    //end

    if (isValid) {
      const currentDate = new Date().toISOString().slice(0, 10) // added by Tejas
      const { FromDate, ToDate } = this.state.getFilter;
      if (FromDate !== "" && ToDate !== "") {
        this.setState({ showReset: true });
        // Added By Tejas For Validating Dates 26/3/2019 --> Start
        if (FromDate > currentDate) {

          NotificationManager.error(<IntlMessages id="trading.openorders.startcurrentdate" />);
        } else if (ToDate < FromDate) {

          NotificationManager.error(<IntlMessages id="trading.openorders.datediff" />);
        } else if (ToDate > currentDate) {

          NotificationManager.error(<IntlMessages id="trading.openorders.endcurrentdate" />);
        } else {

          // var newObj = Object.assign({}, this.state.getFilter);
          newObj.PageIndex = 1;
          newObj.Page_Size = 10;
          this.props.getReferralInviteByChannel(newObj);
        }
        // Added By Tejas For Validating Dates 26/3/2019 --> End
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.listReferralInviteByChannelData.ReturnCode === 0) {
      this.setState({
        Data: nextProps.listReferralInviteByChannelData.ReferralChannelList,
        totalCount: nextProps.listReferralInviteByChannelData.TotalCount
      })
    }
    if (nextProps.payTypeData.ReturnCode === 0 && (nextProps.payTypeData.ReferralPayTypeDropDownList).length > 0) {
      this.setState({
        payTypeList: nextProps.payTypeData.ReferralPayTypeDropDownList
      })
    }
    if (nextProps.listServiceData.ReturnCode === 0 && (nextProps.listServiceData.ReferralServiceDropDownList).length > 0) {
      this.setState({
        serviceData: nextProps.listServiceData.ReferralServiceDropDownList
      })
    }
  }
  handlePageChange = (pageNumber) => {
    this.setState({
      getFilter: {
        ...this.state.getFilter,
        PageIndex: pageNumber
      }
    });
    this.props.getReferralInviteByChannel({
      ...this.state.getFilter,
      PageIndex: pageNumber
    });
  }

  onChangeRowsPerPage = event => {
    this.setState({
      getFilter: {
        ...this.state.getFilter,
        PageIndex: 1,
        Page_Size: event.target.value
      }
    });
    this.props.getReferralInviteByChannel({
      ...this.state.getFilter,
      PageIndex: 1,
      Page_Size: event.target.value
    });
  };
  handleChange = (event) => {
    var newObj = Object.assign({}, this.state.getFilter);
    newObj[event.target.name] = event.target.value;
    this.setState({ getFilter: newObj });
    if (event.target.name === "PayType") {
      this.props.getServiceList({ PayTypeId: event.target.value });
    }
  }
  render() {

    const { Data, totalCount, payTypeList, serviceData, errors } = this.state;
    const { loading } = this.props;
    const { PageIndex, Page_Size, FromDate, ToDate, PayType, Service } = this.state.getFilter;
    let today = new Date();
    today = today.getFullYear() + '-' + ((today.getMonth() + 1) < 10 ? '0' : '') + (today.getMonth() + 1) + '-' + (today.getDate() < 10 ? '0' : '') + today.getDate();
    const options = {
      search: false,
      filterType: "select",
      responsive: "scroll",
      selectableRows: false,
      resizableColumns: false,
      viewColumns: false,
      filter: false,
      download: false,
      serverSide: Data.length !== 0 ? true : false,
      page: PageIndex,
      count: totalCount,
      rowsPerPage: Page_Size,
      textLabels: {
        body: {
          noMatch: <IntlMessages id="wallet.emptyTable" />,
          toolTip: <IntlMessages id="wallet.sort" />,
        }
      },
      customFooter: (
        count,
        page,
        rowsPerPage
      ) => {
        return (
          <CustomFooter count={count} page={page} rowsPerPage={rowsPerPage} handlePageChange={this.handlePageChange} onChangeRowsPerPage={this.onChangeRowsPerPage} />
        );
      },
      onTableChange: (action, tableState) => {
        switch (action) {
          case 'changeRowsPerPage' || "changePage":
            this.setState({
              GetData: {
                ...this.state.Getdata,
                PageIndex: tableState.page,
                Page_Size: tableState.rowsPerPage
              }
            });
            this.props.getReferralInviteByChannel({
              ...this.state.Getdata,
              PageIndex: tableState.page,
              Page_Size: tableState.rowsPerPage
            });
            break;
          default:
            break;
        }
      }
    };
    return (
      <Fragment>
        {loading && <JbsSectionLoader />}
        <JbsCollapsibleCard>
          <Form>
            <Row form>
              <Col md="2" xs="6" sm="6">
                <FormGroup>
                  <Label for="startDate"><IntlMessages id="widgets.startDate" /><span className="text-danger">*</span></Label>
                  <Input type="date" name="FromDate" id="FromDate" placeholder="dd/mm/yyyy" value={FromDate} max={today} onChange={this.handleChange} />
                  {errors.FromDate && <span className="text-danger text-left"><IntlMessages id={errors.FromDate} /></span>}
                </FormGroup>
              </Col>
              <Col md="2" xs="6" sm="6">
                <FormGroup>
                  <Label for="endDate"><IntlMessages id="widgets.endDate" /><span className="text-danger">*</span></Label>
                  <Input type="date" name="ToDate" id="ToDate" placeholder="dd/mm/yyyy" value={ToDate} min={FromDate} max={today} onChange={this.handleChange} />
                  {errors.ToDate && <span className="text-danger text-left"><IntlMessages id={errors.ToDate} /></span>}
                </FormGroup>
              </Col>
              <Col md="2" xs="6" sm="6">
                <FormGroup>
                  <Label for="RewardPayType"><IntlMessages id="my_account.RewardPayType" /></Label>
                  <Input type="select" name="PayType" id="RewardPayType" value={PayType} onChange={this.handleChange}>
                    <IntlMessages id="sidebar.pleaseSelect">{(selectOption) => <option value="">{selectOption}</option>}</IntlMessages>
                    {payTypeList.map((type, key) =>
                      <option key={key} value={type.Id}>{type.PayTypeName}</option>
                    )}
                  </Input>
                </FormGroup>
              </Col>
              <Col md="2" xs="6" sm="6">
                <FormGroup>
                  <Label for="serviceData"><IntlMessages id="my_account.serviceData" /></Label>
                  <Input type="select" name="Service" value={Service} onChange={this.handleChange}>
                    <IntlMessages id="sidebar.pleaseSelect">{(selectOption) => <option value="">{selectOption}</option>}</IntlMessages>
                    {serviceData.map((type, key) =>
                      <option key={key} value={type.Id}>{type.ServiceSlab}</option>
                    )}
                  </Input>
                </FormGroup>
              </Col>
              <Col md="2" xs="6" sm="6">
                <Row>
                  <Col md="4" xs="4" sm="4">
                    <FormGroup className="mt-30">
                      <Button className="perverbtn rounded-0 border-0" disabled={((FromDate === "" || ToDate === "") ? true : false)} onClick={this.getFilterData}><IntlMessages id="widgets.apply" /></Button>
                    </FormGroup>
                  </Col>
                  <Col md="4" xs="4" sm="4">
                    {this.state.showReset && <FormGroup className="mt-30">
                      <Button className="btn-danger text-white rounded-0 border-0" onClick={this.clearFilter}>
                        <IntlMessages id="button.clear" />
                      </Button>
                    </FormGroup>}
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </JbsCollapsibleCard>
        <div className="StackingHistory statusbtn-comm">
          <MUIDataTable
            columns={columns}
            options={options}
            data={
              Data.map((lst, key) => {
                return [
                  key + 1,
                  lst.UserName,
                  lst.ChannelTypeName,
                  lst.PayTypeName,
                  lst.Description,
                  lst.ReferralReceiverAddress,
                  <span className="date">{changeDateFormat(lst.CreatedDate, 'YYYY-MM-DD HH:mm:ss')}</span>
                ]
              })
            }
          />
        </div>
      </Fragment>
    )
  }
}

const mapStateToProps = ({ ReferralProgramReducer }) => {
  const { listReferralInviteByChannelData, listServiceData, payTypeData, loading } = ReferralProgramReducer;
  return { listReferralInviteByChannelData, listServiceData, payTypeData, loading };
}

export default connect(mapStateToProps, {
  getReferralInviteByChannel,
  getPayType,
  getServiceList
})(ReferralInvitationViaEmailSMS);