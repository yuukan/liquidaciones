import React, { Component } from 'react';
import { HashRouter as Router, Route } from "react-router-dom";
// Custom Components
import Header from './components/Header';
import Landing from './components/Landing';
import Home from './components/Home';
import Main from './components/Main';
import Usuarios from './components/Usuarios';
import Empresas from './components/Empresas';
import UserEdit from './components/UserEdit';
import axios from 'axios';
// We import the css
import './css/App.css';

// Fontawesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faPrint, faEnvelope, faTrash, faSignIn } from '@fortawesome/pro-solid-svg-icons';
library.add(faBars, faPrint, faEnvelope, faTrash, faSignIn);

let url = window._url;

let load = 10;
class App extends Component {
  constructor(props) {
    super(props);
    this.changeLogged = this.changeLogged.bind(this);
    this.loadAll = this.loadAll.bind(this);
    this.clearState = this.clearState.bind(this);
    this.loadUsers = this.loadUsers.bind(this);
    this.loadEmpresas = this.loadEmpresas.bind(this);
    this.loadSAP = this.loadSAP.bind(this);
    this.loadRoles = this.loadRoles.bind(this);

    this.state = {
      logged: false,
      users: [],
      empresas: [],
      usuariosSAP: [],
      proveedoresSAP: [],
      roles: []
    };
  }

  // clear State
  clearState() {
    this.setState({
      logged: false,
      users: [],
      empresas: []
    })
  }

  //Function to change the logged state
  changeLogged(logged) {
    this.setState({ logged });
  }

  componentDidMount() {
    // We set the logged in
    let id = localStorage.getItem("lu_id");
    if (id) {
      this.setState({ logged: true });
      this.loadAll();
    }
  }

  loadAll() {
    this.loadUsers();
    this.loadEmpresas();
    this.loadSAP();
    this.loadRoles();
  }

  loadUsers() {
    let t = this;
    axios({
      method: 'get',
      url: url + 'users',
      responseType: "json",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (resp) {
        t.setState({ users: resp.data });
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  // Load empresas list
  loadEmpresas() {
    let t = this;
    axios({
      method: 'get',
      url: url + 'empresa',
      responseType: "json",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (resp) {
        t.setState({ empresas: resp.data });
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  // Load roles list
  loadRoles() {
    let t = this;
    axios({
      method: 'get',
      url: url + 'roles',
      responseType: "json",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (resp) {
        t.setState({ roles: resp.data });
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  // Load sap info
  loadSAP() {
    let t = this;
    // Get usuarios de SAP
    axios({
      method: 'get',
      url: url + 'sap/usuarios',
      responseType: "json",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (resp) {
        t.setState({ usuariosSAP: resp.data });
      })
      .catch(function (err) {
        console.log(err);
      });
    // Get usuarios de SAP
    axios({
      method: 'get',
      url: url + 'sap/proveedores',
      responseType: "json",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (resp) {
        t.setState({ proveedoresSAP: resp.data });
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  render() {
    return (
      <Router>
        <div id="main">
          <Header
            isLoggedIn={this.state.logged}
            changeLogged={this.changeLogged}
            prices_flag={this.state.prices_flag}
            user_permissions={this.state.user_permissions}
            loading={load !== 0}
            clearState={this.clearState}
          />
          {
            !this.state.logged ?
              (
                <Route path="/"
                  render={(props) =>
                    <Landing {...props}
                      url={url}
                      logged={this.state.logged}
                      changeLogged={this.changeLogged}
                      setUserPermissions={this.setUserPermissions}
                      setUserInfo={this.setUserInfo}
                      clientes={this.state.clientes}
                      productos={this.state.productos}
                      fletes={this.state.fletes}
                      get_vendedores={this.get_vendedores}
                      loadAll={this.loadAll}
                    />} />
              ) :
              (
                <React.Fragment>
                  <Route exact path="/"
                    render={(props) =>
                      <Landing {...props}
                        url={url}
                        logged={this.state.logged}
                        changeLogged={this.changeLogged}
                        setUserInfo={this.setUserInfo}
                        clientes={this.state.clientes}
                        productos={this.state.productos}
                        fletes={this.state.fletes}
                        get_vendedores={this.get_vendedores}
                      />} />

                  <Route path="/main"
                    render={(props) =>
                      <Main {...props}
                      />} />

                  <Route path="/usuarios"
                    render={(props) =>
                      <Usuarios {...props}
                        url={url}
                        data={this.state.users}
                        loadUsers={this.loadUsers}
                      />} />

                  <Route path="/edit-user/:id?"
                    render={(props) =>
                      <UserEdit {...props}
                        url={url}
                        ListadoEmpresas={this.state.empresas}
                        usuariosSAP={this.state.usuariosSAP}
                        proveedoresSAP={this.state.proveedoresSAP}
                        users={this.state.users}
                        roles={this.state.roles}
                      />} />

                  <Route path="/empresas"
                    render={(props) =>
                      <Empresas {...props}
                        url={url}
                        data={this.state.empresas}
                        loadUsers={this.loadUsers}
                      />} />

                  <Route path="/nueva-orden"
                    render={(props) =>
                      <Home {...props}
                        url={url}
                        logged={this.state.logged}
                        changeLogged={this.changeLogged}
                        setUserInfo={this.setUserInfo}
                        clientes={this.state.clientes}
                        productos={this.state.productos}
                        fletes={this.state.fletes}
                        plants={this.state.plants}
                        load_orders={this.load_orders}
                        load_products={this.load_products}
                        config={this.state.config}
                        tipo_pago={this.state.tipo_pago}
                        vendedores={this.state.vendedores}
                        vendedor={this.state.vendedor}
                      />} />
                </React.Fragment>
              )}
        </div>
      </Router>
    );
  }
}

export default App;
