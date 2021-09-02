import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import esLocale from "date-fns/locale/es";
import DateFnsUtils from '@date-io/date-fns';
import Button from '@material-ui/core/Button';
import swal from 'sweetalert';
import Select2 from 'react-select';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';
import moment from 'moment';

import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';


class Asignar extends Component {

    constructor() {
        super();
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeSelect = this.handleChangeSelect.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.agregarDetalle = this.agregarDetalle.bind(this);
        this.guardarPedido = this.guardarPedido.bind(this);
        this.delete = this.delete.bind(this);
        this.state = {
            cliente: null,
            direccion: null,
            transporte: null,
            transporte_original: null,
            producto: null,
            compartimiento: null,
            fechaEntrega: null,
            fechaEntregaOriginal: null,
            tipoPago: null,
            fleteAplicado: 0,
            montoPorGalon: 0,
            montoPorGalonOriginal: 0,
            cantidadCompartimientos: 0,
            cantidad: 0,
            detalle: [],
            exclusivo: 0,
            exclusivoid: 0,
            comentario: "",
            id: 0,
            planta: null,
            planta_original: null,
            order: null
        }
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    NoResults() {
        return "Sin Resultados";
    }

    delete(idx) {
        // console.log(idx);
        let detalle = this.state.detalle.slice(0);
        detalle.splice(idx, 1);
        this.setState({ detalle, exclusivo: 0, exclusivoid: 0 });

    }
    //############################################################
    handleChangeSelect(option, b) {

        if (b.name === "transporte") {
            // console.log(option.compartimientos.length, this.state.order.Compartimientos.length);
            if (option.compartimientos.length < this.state.order.Compartimientos.length) {
                swal("Error", "El transporte debe de tener la misma cantidad de compartimientos o más.", "error");
                return false;
            }
        }

        this.setState({ [b.name]: option });

        if (b.name === "cliente") {
            this.setState({ direccion: null });
        }

        if (b.name === "fleteAplicado") {
            this.setState({ transporte: null, compartimiento: null, detalle: [], exclusivo: 0, exclusivoid: 0 });
        }
    }

    handleDateChange(fechaEntrega) {
        this.setState({ fechaEntrega });
    }

    agregarDetalle() {
        // We check if we have the compartments full
        if (this.state.cantidadCompartimientos <= this.state.detalle.length && typeof this.fleteAplicado !== 'undefined' && this.fleteAplicado.value === 2) {
            swal("Error", "Ya estan ocupados todos los compartimientos del Cisterna!", "error");
            return;
        }
        if (this.state.producto === "") {
            swal("Error", "Debe de seleccionar un producto", "error");
            return;
        }
        if (this.state.cantidad === 0 || this.state.cantidad === "") {
            swal("Error", "Debe agregar la cantidad", "error");
            return;
        }
        if (this.state.compartimiento === 0 && this.state.transporte) {
            swal("Error", "Debe agregar el compartimiento", "error");
            return;
        }
        if (this.state.compartimiento) {
            if (this.state.cantidad > parseInt(this.state.compartimiento.galones)) {
                swal("Error", "El compartimiento no puede recibir más de " + this.state.compartimiento.galones + " galones", "error");
                return;
            }
        }
        let row = [];
        let exclusivo = 0, exclusivoid = 0;
        if (this.state.compartimiento) {
            row = [this.state.producto.value, this.state.cantidad, this.state.compartimiento.value, this.state.producto.label, this.state.producto.color];
        } else {
            row = [this.state.producto.value, this.state.cantidad, 0, this.state.producto.label, this.state.producto.color];
        }
        let detalle = this.state.detalle.splice(0);
        detalle.push(row);

        if (this.state.producto.exclusivo === "si") {
            exclusivo = 1;
            exclusivoid = this.state.producto.value;
        } else {
            exclusivo = 2;
        }
        this.setState({ detalle, producto: "", cantidad: 0, compartimiento: 0, exclusivo, exclusivoid });
    }

    formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    guardarPedido() {
        let t_ = this;
        let t = this.state;
        axios.post(this.props.url + "api/assign-order", {
            diaEntrega: ("0" + t.fechaEntrega.getDate()).slice(-2),
            mesEntrega: ("0" + (t.fechaEntrega.getMonth() + 1)).slice(-2),
            anioEntrega: t.fechaEntrega.getFullYear(),
            hora: t.fechaEntrega.getHours(),
            minutos: t.fechaEntrega.getMinutes(),
            diaEntregaOriginal: ("0" + t.fechaEntregaOriginal.getDate()).slice(-2),
            mesEntregaOriginal: ("0" + (t.fechaEntregaOriginal.getMonth() + 1)).slice(-2),
            anioEntregaOriginal: t.fechaEntregaOriginal.getFullYear(),
            horaOriginal: t.fechaEntregaOriginal.getHours(),
            minutosOriginal: t.fechaEntregaOriginal.getMinutes(),
            transporte: t.transporte.id,
            transporte_original: t.transporte_original.id,
            transporte_label: t.transporte.label,
            transporte_original_label: t.transporte_original.label,
            comentario: t.comentario,
            planta: t.planta.value,
            planta_original: t.planta_original.value,
            planta_label: t.planta.label,
            planta_original_label: t.planta_original.label,
            id: this.props.match.params.id,
            montoPorGalon: t.montoPorGalon,
            montoPorGalonOriginal: t.montoPorGalonOriginal,
            user: window.localStorage.getItem('tp_uid')
        })
            .then(function () {
                // t.setState({ clientes: response.data });
                t_.props.load_orders();
                t_.props.history.push("/order-list");
            })
            .catch(function (error) {
                console.log(error);
            });

    }

    // static getDerivedStateFromProps(nextProps, prevState) {
    //     if (nextProps.match.params.id !== prevState.id && nextProps.orders.length > 0 && nextProps.plants) {
    //         let order = nextProps.orders.findIndex(x => x.id === nextProps.match.params.id);
    //         order = nextProps.orders[order];

    //         let tra = nextProps.fletes.findIndex(x => parseInt(x.id) === parseInt(order.idFlete));
    //         tra = nextProps.fletes[tra];

    //         let pla = nextProps.plants.findIndex(x => parseInt(x.value) === parseInt(order.planta));
    //         pla = nextProps.plants[pla];

    //         let id = nextProps.match.params.id;

    //         let montoPorGalon = parseFloat(order.FleteXGalon).toLocaleString('en-US', {
    //             minimumFractionDigits: 2,
    //             maximumFractionDigits: 2
    //         });

    //         let d = moment(order.fecha_carga + " " + order.HoraCarga);
    //         d = d.toDate();

    //         return { fechaEntrega: d, fechaEntregaOriginal: d, id, transporte: tra, transporte_original: tra, planta: pla, planta_original: pla, order, montoPorGalon, montoPorGalonOriginal: montoPorGalon };
    //     }
    //     return null;
    // }

    // componentDidUpdate() {
    //     if (this.props.match.params.id !== this.state.id && this.props.orders.length > 0) {
    //         let order = this.props.orders.findIndex(x => x.id === this.props.match.params.id);
    //         order = this.props.orders[order];
    //         let id = this.props.match.params.id;

    //         let d = moment(order.fecha_carga + " " + order.HoraCarga);
    //         d = d.toDate();

    //         this.setState({ fechaEntrega: d, id });
    //     }
    // }

    componentDidMount(){
        let t = this;
        axios.post(t.props.url + "api/get-order",{id:t.props.match.params.id})
        .then(function (response) {
            let order = response.data[0];
            let id = t.props.match.params.id;

            let d = moment(order.fecha_carga + " " + order.HoraCarga);
            d = d.toDate();

            let tra = t.props.fletes.findIndex(x => parseInt(x.id) === parseInt(order.idFlete));
            tra = t.props.fletes[tra];

            let pla = t.props.plants.findIndex(x => parseInt(x.value) === parseInt(order.planta));
            pla = t.props.plants[pla];

            let montoPorGalon = parseFloat(order.FleteXGalon).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            t.setState({ order: order,fechaEntrega: d, id, fechaEntregaOriginal: d, transporte: tra, transporte_original: tra, planta: pla, planta_original: pla,  montoPorGalon, montoPorGalonOriginal: montoPorGalon });
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {

        let order = this.state.order;
        let flete = null;
        // if (this.props.orders) {
        if(order){
            // order = this.props.orders.findIndex(x => x.id === this.props.match.params.id);
            // order = this.props.orders[order];
            // if (typeof order !== "undefined") {
                flete = this.props.fletes.findIndex((x) => {
                    return parseInt(x.id) === parseInt(order.idFlete)
                });
                flete = this.props.fletes[flete];
            // }
        }

        let conts = [];

        if (order && order.flete && flete) {
            for (let i = flete.compartimientos.length - 1; i >=0 ; i--) {

                // let filled = 0;
                let product = "";
                let height = 0;
                let color = "transparent";
                let CantidadGalones = flete.compartimientos[i].CantidadGalones;
                let cantidad = 0;

                for (let j = 0; j < order.Compartimientos.length; j++) {
                    if (parseInt(order.Compartimientos[j].Compartimiento) === i + 1) {
                        product = order.Compartimientos[j].Nombre;
                        color = order.Compartimientos[j].Color
                        height = parseInt(order.Compartimientos[j].cantidad) / parseInt(CantidadGalones) * 100;
                        cantidad = order.Compartimientos[j].cantidad;
                    }
                }

                let style = {
                    height: `${height}%`,
                    backgroundColor: `#${color}`
                };

                conts.push(
                    <div key={`cont${i}`} className={`cont cont${i + 1}`}>
                        <div className="number">{cantidad} / {CantidadGalones}</div>
                        <div className="product">{product} ({i + 1})</div>
                        <div className={`fill`} style={style}></div>
                    </div>
                );
            }
        }

        let comentarios = "";
        if (order && typeof order.comentarios !== "undefined" && order.comentarios.length > 0) {
            comentarios = order.comentarios.map((key, idx) => {
                let da = new Date(key.created_at);
                return (
                    <li key={idx}
                    >
                        <div className="date">
                            {da.getDate()}/{da.getMonth()}/{da.getFullYear()} {this.formatAMPM(da)}
                        </div>
                        <div className="user">
                            {key.name}
                        </div>
                        <div className="comment">
                            {key.comentario}
                        </div>
                    </li>
                );
            });
        }

        // We build the addresses bar
        let addresses = [];
        let c = this.state.cliente;
        if (c) {
            if (c.address !== "") {
                addresses.push({ value: c.address, label: c.address });
            }
            if (c.MailAddres !== "" && c.MailAddres !== c.address) {
                addresses.push({ value: c.MailAddres, label: c.MailAddres });
            }
        }

        // let tipos_pago = [
        //     { value: 1, label: "Contado" },
        //     { value: 2, label: "Crédito" }
        // ];

        // let flete_aplicado = [
        //     { value: 1, label: "Si" },
        //     { value: 2, label: "No" }
        // ];

        // #################################################
        // Product Filters
        // #################################################
        let productos = "";
        if (this.props.productos) productos = this.props.productos.slice(0);

        if (this.state.exclusivo === 1) {
            let p = [];
            for (let i = 0; i < productos.length; i++) {
                if (this.state.exclusivoid === productos[i].value) {
                    p.push(productos[i]);
                }
            }
            productos = p;
        }

        if (this.state.exclusivo === 2) {
            let p = [];
            for (let i = 0; i < productos.length; i++) {
                if (productos[i].exclusivo === "") {
                    p.push(productos[i]);
                }
            }
            productos = p;
        }

        // #################################################
        // Product Filters
        // #################################################

        let tot = 0;
        return (
            <div className="main-container">
                <Typography variant="h3" component="h1" gutterBottom>
                    Asignar Horario
                </Typography>
                <div className="landing-container">
                    <Grid container spacing={2} justify="space-around">
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
                                <KeyboardDatePicker
                                    margin="normal"
                                    className="full-width"
                                    id="mui-pickers-date"
                                    label="Fecha de Carga"
                                    value={this.state.fechaEntrega}
                                    onChange={this.handleDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
                                <KeyboardTimePicker
                                    margin="normal"
                                    className="full-width"
                                    id="mui-pickers-time"
                                    label="Hora de Carga"
                                    ampm={false}
                                    value={this.state.fechaEntrega}
                                    onChange={this.handleDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'Cambiar hora',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <FormControl variant="outlined" className="form-item margin-fix2">
                                <Select2
                                    value={this.state.planta}
                                    isSearchable={true}
                                    onChange={this.handleChangeSelect}
                                    name="planta"
                                    options={this.props.plants}
                                    placeholder="*Seleccione una planta"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <label className="label">
                                Cliente
                            </label>
                            {order ? order.CodigoCliente : ""}
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <label className="label">
                                Tipo de Pago
                            </label>
                            {order ? order.tipo_pago : ""}
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <label className="label">
                                Dirección
                            </label>
                            {order ? order.Direccion : ""}
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <FormControl variant="outlined" className="form-item small">
                                <label className="label">
                                    Forma de carga
                                </label>
                                {order ? (order.FleteAplicado === "1" ? "Ex Rack" : "Puesto en el lugar") : ""}
                            </FormControl>
                            <FormControl variant="outlined" className="form-item small">
                                <TextField
                                    id="montoPorGalon"
                                    name="montoPorGalon"
                                    label="Monto por Galón"
                                    className="montoPorGalon"
                                    value={this.state.montoPorGalon}
                                    onChange={this.handleChange}
                                    margin="normal"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <label className="label">
                                Transporte
                            </label>
                            <FormControl variant="outlined" className="form-item">
                                <Select2
                                    value={this.state.transporte}
                                    isSearchable={true}
                                    onChange={this.handleChangeSelect}
                                    name="transporte"
                                    options={this.props.fletes}
                                    placeholder="Transporte"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} lg={6}>
                            <FormControl variant="outlined" className="form-item">
                                <label className="label">
                                    Comentario
                                </label>
                                <div dangerouslySetInnerHTML={{ __html: order ? order.Comentarios : "" }} />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} lg={6}></Grid>
                    </Grid>
                </div>
                <Typography variant="h4" component="h2" gutterBottom className="margin-separation">
                    Comentarios
                </Typography>
                <div className="landing-container padding-bottom-separation">
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <FormControl variant="outlined" className="form-item">
                            <TextField
                                name="comentario"
                                id="comentario"
                                label="Comentario"
                                multiline
                                rowsMax="10"
                                value={this.state.comentario}
                                onChange={this.handleChange}
                                margin="normal"
                                ref={this.comentario}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <ul className="comentarios">
                            {comentarios}
                        </ul>
                    </Grid>
                </div>
                <Typography variant="h4" component="h2" gutterBottom className="margin-separation">
                    Detalle de Productos
                </Typography>
                <div className="landing-container padding-bottom-separation">
                    <Grid container spacing={2} justify="space-around" className="padding-top-separation">
                        <Grid item xs={12} sm={6} md={6} lg={6}>
                            <h3 className="transporte-title">
                                {flete ? flete.label : ""}
                            </h3>
                            <div className="cisterna">
                                <div className="cisterna-circle">
                                    {conts}
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} justify="space-around" className="margin-separation">
                        <Grid item xs={12} sm={6} md={2} lg={2} className="th">
                            <strong>Producto</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={1} lg={1} className="th goCenter">
                            <strong>Cantidad</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={1} lg={1} className="th goCenter">
                            <strong>Compartimiento</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2} lg={2} className="th goRight">
                            <strong>Precio</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2} lg={2} className="th goRight">
                            <strong>IDP</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2} lg={2} className="th goRight">
                            <strong>IVA</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2} lg={2} className="th goRight">
                            <strong>Subtotal</strong>
                        </Grid>
                        {order && typeof order.Compartimientos !== "undefined" && order.Compartimientos.length > 0
                            ? order.Compartimientos.map((key, idx) => {
                                tot += parseFloat((key.Precio * key.cantidad).toFixed(2));
                                let subTotal = parseFloat((key.Precio * key.cantidad).toFixed(2));
                                return (
                                    <React.Fragment key={`p${idx}`}>
                                        <Grid item xs={6} sm={6} md={2} lg={2} className="ch">
                                            <strong>Producto</strong>
                                            {key.Nombre}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={1} lg={1} className="ch goRight">
                                            <strong>Cantidad</strong>
                                            {key.cantidad}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={1} lg={1} className="ch goCenter">
                                            <strong>Compartimiento</strong>
                                            {key.Compartimiento !== 0 ? key.Compartimiento : ""}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={2} lg={2} className="ch goRight">
                                            <strong>Precio</strong>
                                            Q {key.Precio}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={2} lg={2} className="ch goRight">
                                            <strong>IDP</strong>
                                            Q {key.IDP}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={2} lg={2} className="ch goRight">
                                            <strong>IVA</strong>
                                            Q {(key.Precio - ((key.Precio - key.IDP) / 1.12)).toFixed(2)}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={2} lg={2} className="ch goRight">
                                            <strong>Subtotal</strong>
                                            Q {subTotal.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={12} lg={12} className="mobile">
                                            &nbsp;
                                    </Grid>
                                        <Grid item xs={12} sm={12} md={12} lg={12} className="separator">
                                            &nbsp;
                                    </Grid>
                                    </React.Fragment>
                                )
                            })
                            : ""}

                        <Grid item xs={6} sm={6} md={10} lg={10} className="tot goRight">
                            <strong>Total</strong>
                        </Grid>
                        <Grid item xs={6} sm={6} md={2} lg={2} className="tot goRight">
                            Q {tot.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                        </Grid>

                    </Grid>
                </div>
                <Grid container spacing={2} justify="flex-end" className="padding-top-separation">
                    <Grid item xs={2} sm={2} md={2} lg={2}>
                        <Button variant="contained" color="primary" className="pull-right" onClick={this.guardarPedido}>
                            Guardar
                        </Button>
                    </Grid>
                </Grid>
            </div>
        );
    }
}
export default Asignar;