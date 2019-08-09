/**
 * About Us Page
 */
import React, { Component } from "react";
import MUIDataTable from "mui-datatables";

// intl messages
import IntlMessages from "Util/IntlMessages";

// jbs card box
import JbsCollapsibleCard from "Components/JbsCollapsibleCard/JbsCollapsibleCard";

const ExDatatable = ({ title, data, columns, options , darkMode }) => {
  return (
    <div className={darkMode ? 'DepositWithdrawHistory-darkmode':'DepositWithdrawHistory'}>
      <JbsCollapsibleCard
        heading={<IntlMessages id={title} />}
        reloadable
        fullBlock
      >
        <MUIDataTable
          title=""
          data={data}
          columns={columns}
          options={options}
        />
      </JbsCollapsibleCard>
    </div>
  );
};

ExDatatable.defaultProps = {
  title: "",
  data: [],
  columns: [],
  options: []
};

export default ExDatatable;
