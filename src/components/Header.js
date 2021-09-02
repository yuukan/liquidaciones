import React, { Component } from 'react';
import { Link } from "react-router-dom";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { LocalShipping, ListAltTwoTone, CheckBox, Schedule, Report } from '@material-ui/icons';
import Button from '@material-ui/core/Button';
import swal from 'sweetalert';


class Header extends Component {
    constructor(props) {
        super(props);
        this.handleDrawerClose = this.handleDrawerClose.bind(this);
        this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
        this.changeIndex = this.changeIndex.bind(this);
        this.logOut = this.logOut.bind(this);
        this.state = {
            selectedIndex: 1,
            openDrawer: false
        };
    }

    handleDrawerClose() {
        this.setState({ openDrawer: false });
    }

    handleDrawerOpen() {
        this.setState({ openDrawer: true });
    }

    changeIndex(selectedIndex) {
        this.handleDrawerClose();
        this.setState({ selectedIndex });
    }

    logOut() {
        swal("", "Desea salir del sistema?", {
            buttons: ["No", "Si"],
            icon: "warning"
        }).then((salir) => {
            if (salir !== null) {
                this.props.changeLogged(false);
                localStorage.removeItem("tp_uid");
                localStorage.removeItem("tp_uid_per");
                localStorage.removeItem("tp_vendedor");
                this.props.clearState();
                window.location.href="/";
            }
        });
    }


    render() {
        let cl = "";
        if (!this.props.prices_flag) cl = "red";
        // We check if the user is logged in
        if (this.props.isLoggedIn) {
            return (
                <React.Fragment>
                    <AppBar position="static">
                        <Toolbar className={`toolbar ${cl}`}>
                            <IconButton edge="start" color="inherit" aria-label="menu" onClick={this.handleDrawerOpen}>
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="h6">
                                {
                                    !this.props.prices_flag ? (
                                        <span>{`(Precios no actualizados)`}</span>
                                    ) :
                                        (
                                            <img src="images/logo.png" alt="" />
                                        )
                                }
                            </Typography>
                            {
                                this.props.loading ?
                                (
                                    !this.props.prices_flag ? (
                                        <img src="images/loadingwhite.gif" alt="" width="32" />
                                    ):
                                    (
                                        <img src="images/loading.gif" alt="" width="32" />
                                    )
                                ): ""
                            }
                            <Button color="inherit" onClick={this.logOut}>Salir</Button>
                        </Toolbar>
                    </AppBar>
                    <Drawer
                        variant="persistent"
                        anchor="left"
                        className="Drawer"
                        open={this.state.openDrawer}
                    >
                        <div className="drawer-header">
                            <IconButton onClick={this.handleDrawerClose}>
                                <ChevronLeftIcon />
                            </IconButton>
                        </div>
                        <Divider />
                        <List>
                            {
                                this.props.user_permissions.includes("1") ?
                                    (
                                        <Link className="link" to="/nueva-orden" onClick={() => this.changeIndex(0)}>
                                            <ListItem button selected={this.state.selectedIndex === 0}>
                                                <ListItemIcon>
                                                    <LocalShipping />
                                                </ListItemIcon>
                                                <ListItemText primary={`Solicitar Pedido`} />
                                            </ListItem>
                                        </Link>
                                    ) : ""
                            }

                            <Link className="link" to="/order-list" onClick={() => this.changeIndex(1)}>
                                <ListItem button selected={this.state.selectedIndex === 1}>
                                    <ListItemIcon>
                                        <ListAltTwoTone />
                                    </ListItemIcon>
                                    <ListItemText primary={`Listado de Pedidos`} />
                                </ListItem>
                            </Link>
                            {
                                this.props.user_permissions.includes("2") ?
                                    (
                                        <Link className="link" to="/new-list" onClick={() => this.changeIndex(2)}>
                                            <ListItem button selected={this.state.selectedIndex === 2}>
                                                <ListItemIcon>
                                                    <ListAltTwoTone />
                                                </ListItemIcon>
                                                <ListItemText primary={`Asignar Horario`} />
                                            </ListItem>
                                        </Link>
                                    ) : ""
                            }
                            {
                                this.props.user_permissions.includes("3") ?
                                    (
                                        <Link className="link" to="/credit-list" onClick={() => this.changeIndex(3)}>
                                            <ListItem button selected={this.state.selectedIndex === 3}>
                                                <ListItemIcon>
                                                    <ListAltTwoTone />
                                                </ListItemIcon>
                                                <ListItemText primary={`Validación Crédito`} />
                                            </ListItem>
                                        </Link>
                                    ) : ""
                            }
                            {
                                this.props.user_permissions.includes("6") ?
                                    (
                                        <Link className="link" to="/to-schedule" onClick={() => this.changeIndex(7)}>
                                            <ListItem button selected={this.state.selectedIndex === 7}>
                                                <ListItemIcon>
                                                    <Schedule />
                                                </ListItemIcon>
                                                <ListItemText primary={`Pendientes de Programar`} />
                                            </ListItem>
                                        </Link>
                                    ) : ""
                            }
                            {
                                this.props.user_permissions.includes("4") ?
                                    (
                                        <Link className="link" to="/sap-list" onClick={() => this.changeIndex(4)}>
                                            <ListItem button selected={this.state.selectedIndex === 4}>
                                                <ListItemIcon>
                                                    <ListAltTwoTone />
                                                </ListItemIcon>
                                                <ListItemText primary={`Subir a SAP`} />
                                            </ListItem>
                                        </Link>
                                    ) : ""
                            }
                            {
                                this.props.user_permissions.includes("7") ?
                                    (
                                        <Link className="link" to="/cancelled-list" onClick={() => this.changeIndex(5)}>
                                            <ListItem button selected={this.state.selectedIndex === 5}>
                                                <ListItemIcon>
                                                    <ListAltTwoTone />
                                                </ListItemIcon>
                                                <ListItemText primary={`Pedidos Anulados`} />
                                            </ListItem>
                                        </Link>
                                    ) : ""
                            }
                            {
                                this.props.user_permissions.includes("8") ?
                                    (
                                        <Link className="link" to="/processed-list" onClick={() => this.changeIndex(6)}>
                                            <ListItem button selected={this.state.selectedIndex === 6}>
                                                <ListItemIcon>
                                                    <CheckBox />
                                                </ListItemIcon>
                                                <ListItemText primary={`Procesadas`} />
                                            </ListItem>
                                        </Link>
                                    ) : ""
                            }
                            <Divider />
                            <Link className="link" to="/reporte-vendedores" onClick={() => this.changeIndex(7)}>
                                <ListItem button selected={this.state.selectedIndex === 7}>
                                    <ListItemIcon>
                                        <Report />
                                    </ListItemIcon>
                                    <ListItemText primary={`Reporte Vendedores`} />
                                </ListItem>
                            </Link>
                        </List>
                        <Divider />
                    </Drawer>
                </React.Fragment >
            );
        }

        return "";

    }
}
export default Header;