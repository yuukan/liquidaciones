import React, { Component } from 'react';
import { Redirect } from 'react-router'
import axios from 'axios';
import swal from 'sweetalert';
import Cookies from 'js-cookie';

class Landing extends Component {

    constructor() {
        super();
        this.login = this.login.bind(this);
        this.email = React.createRef();
        this.password = React.createRef();
    }

    //####################################Login####################################
    login(e) {
        e.preventDefault();
        // this.props.changeLogged(true);

        let this_ = this;
        let email = this.email.current.value;
        let password = this.password.current.value;

        var data = JSON.stringify({
            email,
            password
        });

        axios({
            method: 'post',
            url: this.props.url + 'users/login',
            data,
            responseType: "json",
            headers: { "Content-Type": "application/json" }
        })
            .then(function (resp) {
                Cookies.set('lu_id', resp.data.id, { expires: 1 });
                Cookies.set('lu_n', resp.data.nombre, { expires: 1 });
                Cookies.set('lu_rol', resp.data.rol, { expires: 1 });
                this_.props.changeLogged(true);
                this_.props.loadAll();
                // this_.props.setUserPermissions(resp.data.permissions.split(","));
            })
            .catch(function (err) {
                console.log(err);
                swal("Error", err.response.data.msg, "error");
            });
    }
    //####################################Login####################################

    render() {
        return (
            <div className="landing">
                {
                    this.props.logged ? (<Redirect to="/liquidaciones" />) : ""
                }
                <div className="splash">
                    <img src="images/logo.png" alt="Logo" />
                    <div className="email-form">
                        <form onSubmit={this.login}>
                            <div className="input-container">
                                <input type="text" autoFocus placeholder="Email" required ref={this.email} />
                            </div>
                            <div className="input-container">
                                <input type="password" placeholder="Contraseña" required ref={this.password} />
                            </div>
                            <div className="input-container">
                                <button type="submit" className="login-btn">
                                    <span>
                                        Ingresar
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        );
    }
}
export default Landing;