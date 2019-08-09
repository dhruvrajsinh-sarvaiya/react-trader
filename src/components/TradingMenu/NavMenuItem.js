/**
 * Nav Menu Item
 */
import React, { Fragment, Component } from "react";
import { NavLink, withRouter } from "react-router-dom";
import $ from "jquery";
import IntlMessages from "Util/IntlMessages";

//Helper
import { getAppLayout } from "Helpers/helpers";

class NavMenuItem extends Component {
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions = () => {
    this.setState({ windowWidth: $(window).width() });
  };

  /**
   * GetlayoutHandler
   */
  getLayoutHandler() {
    return getAppLayout(this.props.location);
  }

  render() {
    const { menu } = this.props;
    return (
      <li className="nav-item">
        {menu.child_routes !== null ? (
          <Fragment>
            <a href="javascript:void(0);" className="nav-link">
              <i className={menu.menu_icon} />
              <span className="menu-title"><IntlMessages id={menu.menu_title} /></span>
            </a>
            <ul className="list-unstyled sub-menu">
              {menu.child_routes.map((subMenu, subKey) => {
                if (!subMenu.child_routes) {
                  return (
                    <li className="nav-item" key={subKey}>
                      <NavLink
                        to={
                          !subMenu.exact
                            ? `/${this.getLayoutHandler() + subMenu.path}`
                            : subMenu.path
                        }
                        className="nav-link no-arrow"
                        activeClassName="active"
                      >
                        <IntlMessages id={subMenu.menu_title} />
                      </NavLink>
                    </li>
                  );
                }
                return (
                  <li className="nav-item" key={subKey}>
                    <a href="javascript:void(0);" className="nav-link">
                    <span className="menu-title"><IntlMessages id={subMenu.menu_title} /></span>
                    </a>
                    <ul className="list-unstyled sub-menu-sub-child">
                      {subMenu.child_routes.map((nestedMenu, nestedKey) => (
                        <li className="nav-item" key={nestedKey}>
                          <NavLink
                            to={nestedMenu.path}
                            className="nav-link"
                            activeClassName="active"
                          >
                            <IntlMessages id={nestedMenu.menu_title} />
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </Fragment>
        ) : (
          <NavLink
            to={
              !menu.exact
                ? `/${this.getLayoutHandler() + menu.path}`
                : menu.path
            }
            className="nav-link no-arrow"
          >
            <i className={menu.menu_icon} />
            <span className="menu-title"><IntlMessages id={menu.menu_title} /></span>
          </NavLink>
        )}
      </li>
    );
  }
}

export default withRouter(NavMenuItem);
