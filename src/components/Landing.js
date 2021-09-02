import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Redirect } from 'react-router'
import axios from 'axios';
import swal from 'sweetalert';

class Landing extends Component {

    constructor() {
        super();
        this.login = this.login.bind(this);
        this.state = {
            email: false
        };
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

        axios.post(this.props.url + "api/login", {
            email,
            password
        })
            .then(function (response) {
                if (response.data.error === 0) {
                    localStorage.setItem("tp_uid", response.data.id);
                    this_.props.setUserPermissions(response.data.permissions.split(","));
                    localStorage.setItem("tp_uid_per", response.data.permissions.split(","));
                    localStorage.setItem("tp_vendedor", response.data.vendedor);
                    this_.props.changeLogged(true);
                    this_.props.get_vendedores();
                    this_.props.loadAll();
                } else {
                    swal("Error", response.data.message, "error");
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }
    //####################################Login####################################

    render() {
        return (
            <div className="landing">
                {
                    this.props.logged ? (<Redirect to="/order-list" />) : ""
                }
                <div className="splash">
                    <img src="images/logo.png" alt="Logo" />
                    <div className="email-form">
                        <form onSubmit={this.login}>
                            <input type="text" autoFocus placeholder="Email" required ref={this.email} />
                            <input type="password" placeholder="Contraseña" required ref={this.password} />
                            <button type="submit" className="gohome">
                                <FontAwesomeIcon icon="sign-in" />
                                <span>
                                    Ingresar
                                </span>
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        );
    }
}
export default Landing;