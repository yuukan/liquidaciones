import React, { Component } from 'react';
import { HashRouter as Router, Route } from "react-router-dom";
// Custom Components
import Header from './components/Header';
import Landing from './components/Landing';
import Main from './components/Main';
import Usuarios from './components/Usuarios';
import UserEdit from './components/UserEdit';
import Empresas from './components/Empresas';
import EmpresaEdit from './components/EmpresaEdit';
import Bancos from './components/Bancos';
import BancoEdit from './components/BancoEdit';
import Cuentas from './components/Cuentas';
import CuentaEdit from './components/CuentaEdit';
import Gastos from './components/Gastos';
import axios from 'axios';
import GastoEdit from './components/GastoEdit';
import Presupuestos from './components/Presupuestos';
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
    this.loadGastos = this.loadGastos.bind(this);
    this.loadSAP = this.loadSAP.bind(this);
    this.loadRoles = this.loadRoles.bind(this);
    this.loadBancos = this.loadBancos.bind(this);
    this.loadCuentas = this.loadCuentas.bind(this);
    this.loadGastosGrupos = this.loadGastosGrupos.bind(this);

    this.state = {
      logged: false,
      users: [],
      empresas: [],
      gastos: [],
      bancos: [],
      cuentas: [],
      usuariosSAP: [],
      proveedoresSAP: [],
      roles: [],
      grupos: [],
      cuentas_contables:[],
      impuestos: [],
      presupuestos: []
    };
  }

  // clear State
  clearState() {
    this.setState({
      logged: false,
      users: [],
      empresas: [],
      gastos: [],
      bancos: [],
      cuentas: [],
      usuariosSAP: [],
      proveedoresSAP: [],
      roles: [],
      grupos: [],
      cuentas_contables:[],
      impuestos: [],
      presupuestos: []
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
    this.loadGastos();
    this.loadGastosGrupos();
    this.loadSAP();
    this.loadRoles();
    this.loadBancos();
    this.loadCuentas();
    this.loadPresupuestos();
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

  // Load gastos list
  loadGastos() {
    let t = this;
    axios({
      method: 'get',
      url: url + 'gastos',
      responseType: "json",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (resp) {
        t.setState({ gastos: resp.data });
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  // Load presupuestos list
  loadPresupuestos() {
    let t = this;
    axios({
      method: 'get',
      url: url + 'presupuestos',
      responseType: "json",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (resp) {
        t.setState({ presupuestos: resp.data });
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

  // Load bancos info
  loadBancos() {
    let t = this;
    axios({
      method: 'get',
      url: url + 'bancos',
      responseType: "json",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (resp) {
        t.setState({ bancos: resp.data });
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  // Load bancos info
  loadCuentas() {
    let t = this;
    axios({
      method: 'get',
      url: url + 'cuentas',
      responseType: "json",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (resp) {
        t.setState({ cuentas: resp.data });
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  // Load bancos info
  loadGastosGrupos() {
    let t = this;
    axios({
      method: 'get',
      url: url + 'gastos-grupo',
      responseType: "json",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (resp) {
        t.setState({ grupos: resp.data });
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
    // Get cuentas contables de SAP
    axios({
      method: 'get',
      url: url + 'sap/cuentas-contables',
      responseType: "json",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (resp) {
        t.setState({ cuentas_contables: resp.data });
      })
      .catch(function (err) {
        console.log(err);
      });
    // Get usuarios de SAP
    axios({
      method: 'get',
      url: url + 'sap/impuestos',
      responseType: "json",
      headers: { "Content-Type": "application/json" }
    })
      .then(function (resp) {
        t.setState({ impuestos: resp.data });
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
                        loadEmpresas={this.loadEmpresas}
                      />} />

                  <Route path="/edit-empresa/:id?"
                    render={(props) =>
                      <EmpresaEdit {...props}
                        url={url}
                        loadEmpresas={this.loadEmpresas}
                      />} />

                  <Route path="/gastos"
                    render={(props) =>
                      <Gastos {...props}
                        url={url}
                        data={this.state.gastos}
                        loadGastos={this.loadGastos}
                      />} />

                  <Route path="/edit-gasto/:id?"
                    render={(props) =>
                      <GastoEdit {...props}
                        url={url}
                        loadGastos={this.loadGastos}
                        grupos={this.state.grupos}
                        cuentas_contables={this.state.cuentas_contables}
                        impuestos={this.state.impuestos}
                      />} />

                      <Route path="/presupuestos"
                    render={(props) =>
                      <Presupuestos {...props}
                        url={url}
                        data={this.state.presupuestos}
                        loadBancos={this.loadPresupuestos}
                      />} />

                  <Route path="/bancos"
                    render={(props) =>
                      <Bancos {...props}
                        url={url}
                        data={this.state.bancos}
                        loadBancos={this.loadBancos}
                      />} />

                  <Route path="/edit-banco/:id?"
                    render={(props) =>
                      <BancoEdit {...props}
                        url={url}
                        data={this.state.bancos}
                        loadBancos={this.loadBancos}
                        empresas={this.state.empresas}
                      />} />

                  <Route path="/cuentas"
                    render={(props) =>
                      <Cuentas {...props}
                        url={url}
                        data={this.state.cuentas}
                        loadCuentas={this.loadCuentas}
                      />} />

                      <Route path="/edit-cuenta/:id?"
                      render={(props) =>
                        <CuentaEdit {...props}
                          url={url}
                          data={this.state.cuentas}
                          loadCuentas={this.loadCuentas}
                          empresas={this.state.empresas}
                          bancos={this.state.bancos}
                        />} />

                </React.Fragment>
              )}
        </div>
      </Router>
    );
  }
}

export default App;
