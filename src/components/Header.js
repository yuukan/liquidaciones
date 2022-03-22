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
import {
    VerifiedUserSharp,
    Business,
    MoneyOff,
    Money,
    MoneySharp
} from '@material-ui/icons';
import Button from '@material-ui/core/Button';
import swal from 'sweetalert';
import Cookies from 'js-cookie';


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
                Cookies.remove('lu_id');
                Cookies.remove('lu_n');
                this.props.clearState();
                window.location.href = window.location.origin + window.location.pathname;
            }
        });
    }


    render() {
        let cl = "";
        let rol = Cookies.get('lu_rol');
        if (typeof rol !== "undefined") {
            rol = rol.toLowerCase();
        }
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
                                <img src="images/logo.png" alt="" />
                            </Typography>

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
                                rol === "administrador" ?
                                    (
                                        <React.Fragment>
                                            <Link className="link" to="/empresas" onClick={() => this.changeIndex(2)}>
                                                <ListItem button selected={this.state.selectedIndex === 2}>
                                                    <ListItemIcon>
                                                        <Business />
                                                    </ListItemIcon>
                                                    <ListItemText primary={`Empresas`} />
                                                </ListItem>
                                            </Link>
                                            <Link className="link" to="/usuarios" onClick={() => this.changeIndex(1)}>
                                                <ListItem button selected={this.state.selectedIndex === 1}>
                                                    <ListItemIcon>
                                                        <VerifiedUserSharp />
                                                    </ListItemIcon>
                                                    <ListItemText primary={`Usuarios`} />
                                                </ListItem>
                                            </Link>
                                            <Link className="link" to="/gastos" onClick={() => this.changeIndex(3)}>
                                                <ListItem button selected={this.state.selectedIndex === 3}>
                                                    <ListItemIcon>
                                                        <MoneyOff />
                                                    </ListItemIcon>
                                                    <ListItemText primary={`Gastos`} />
                                                </ListItem>
                                            </Link>
                                            <Link className="link" to="/presupuestos" onClick={() => this.changeIndex(4)}>
                                                <ListItem button selected={this.state.selectedIndex === 4}>
                                                    <ListItemIcon>
                                                        <Money />
                                                    </ListItemIcon>
                                                    <ListItemText primary={`Presupuestos`} />
                                                </ListItem>
                                            </Link>
                                        </React.Fragment>
                                    ) : ""
                            }
                            <Link className="link" to="/liquidaciones" onClick={() => this.changeIndex(5)}>
                                <ListItem button selected={this.state.selectedIndex === 5}>
                                    <ListItemIcon>
                                        <MoneySharp />
                                    </ListItemIcon>
                                    <ListItemText primary={`Liquidaciones`} />
                                </ListItem>
                            </Link>
                        </List>
                    </Drawer>
                </React.Fragment >
            );
        }

        return "";

    }
}
export default Header;