import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Select2 from 'react-select';
import swal from 'sweetalert';
import TextField from '@material-ui/core/TextField';
import MaterialTable from 'material-table';
import { forwardRef } from 'react';
import { ViewColumn, Search, SaveAlt, Remove, LastPage, FirstPage, FilterList, Edit, DeleteOutline, Clear, ChevronRight, ChevronLeft, Check, ArrowUpward, AddBox } from '@material-ui/icons/';
import axios from 'axios';
import moment from 'moment';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};
class Creditos extends Component {

    constructor() {
        super();
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeSelect = this.handleChangeSelect.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.agregarDetalle = this.agregarDetalle.bind(this);
        this.aprobarPedido = this.aprobarPedido.bind(this);
        this.delete = this.delete.bind(this);
        this.state = {
            order:null,
            cliente: null,
            direccion: null,
            transporte: null,
            producto: null,
            compartimiento: null,
            fechaEntrega: null,
            tipoPago: null,
            tipoPagoOriginal: null,
            fleteAplicado: 0,
            montoPorGalon: 0,
            cantidadCompartimientos: 0,
            cantidad: 0,
            detalle: [],
            exclusivo: 0,
            exclusivoid: 0,
            comentario: "",
            id: 0,
            planta: null,
            plant_original: null,
            contra_boleta: null,
            columns: [
                { title: 'Fecha', field: 'created_at', type: 'datetime' },
                { title: 'Usuario', field: 'name' },
                { title: 'Tipo Operación', field: 'type' },
                { title: 'Descripción', field: 'Texto', render: rowData => <div dangerouslySetInnerHTML={{ __html: rowData.Texto }} /> }
            ],
            columns2: [
                { title: 'Fecha Emisión', field: 'Fecha_Emision' },
                { title: 'Fecha Vencimiento', field: 'Fecha_Vencimiento' },
                { title: 'Línea de Crédito', field: 'CreditLine', render: rowData => this.numFormat(parseFloat(rowData.CreditLine)) },
                { title: 'Monto Original', field: 'Monto_Original', render: rowData => this.numFormat(parseFloat(rowData.Monto_Original)) },
                { title: 'Monto Vencido', field: 'Monto_Vencido', render: rowData => this.numFormat(parseFloat(rowData.Monto_Vencido)) }
            ]
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
            if (option.compartimientos.length !== this.state.transporte.compartimientos.length) {
                swal("Error", "El transporte debe de tener la misma cantidad de compartimientos.", "error");
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

    formatTime(n) {
        if (n.toString().length < 2) {
            return "0" + n;
        } else {
            return n;
        }
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

    numFormat(num) {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    aprobarPedido(contra_boleta) {
        let t_ = this;
        let t = this.state;
        axios.post(this.props.url + "api/approve-order", {
            comentario: t.comentario,
            id: this.props.match.params.id,
            user: window.localStorage.getItem('tp_uid'),
            tipoPago: this.state.tipoPago.value,
            tipoPagoOriginal: this.state.tipoPagoOriginal.value,
            tipoPago_label: this.state.tipoPago.label,
            tipoPagoOriginal_label: this.state.tipoPagoOriginal.label,
            contra_boleta,
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
    //     if (nextProps.match.params.id !== prevState.id && nextProps.orders && nextProps.orders.length > 0 && nextProps.plants) {
    //         let order = nextProps.orders.findIndex(x => x.id === nextProps.match.params.id);
    //         order = nextProps.orders[order];

    //         let tra = nextProps.fletes.findIndex(x => parseInt(x.id) === parseInt(order.idFlete));
            
    //         tra = nextProps.fletes[tra];

    //         let pla = nextProps.plants.findIndex(x => parseInt(x.value) === parseInt(order.planta));
    //         pla = nextProps.plants[pla];

    //         let id = nextProps.match.params.id;

    //         let tipoPago = {
    //             label: order.NumSAPLabel,
    //             value: order.id_tp
    //         };

    //         let d = moment(order.fecha_carga + " " + order.HoraCarga);
    //         d = d.toDate();

    //         return { fechaEntrega: d, id, transporte: tra, planta: pla, planta_original: pla, tipoPago: tipoPago, tipoPagoOriginal: tipoPago };
    //     }
    //     return null;
    // }

    // componentDidUpdate() {
    //     if (this.props.match.params.id !== this.state.id && this.props.orders && this.props.orders.length > 0) {
    //         let order = this.props.orders.findIndex(x => x.id === this.props.match.params.id);
    //         order = this.props.orders[order];
    //         let id = this.props.match.params.id;

    //         this.setState({ fechaEntrega: new Date(order.FechaCarga + " " + order.HoraCarga), id });
    //     }
    // }
    
    componentDidMount(){
        let t = this;
        axios.post(t.props.url + "api/get-order",{id:t.props.match.params.id})
        .then(function (response) {
            let order = response.data[0];

            let tra = t.props.fletes.findIndex(x => parseInt(x.id) === parseInt(order.idFlete));
            
            tra = t.props.fletes[tra];

            let pla = t.props.plants.findIndex(x => parseInt(x.value) === parseInt(order.planta));
            pla = t.props.plants[pla];


            let tipoPago = {
                label: order.NumSAPLabel,
                value: order.id_tp
            };

            let d = moment(order.fecha_carga + " " + order.HoraCarga);
            d = d.toDate();

            t.setState(
                { 
                    order: order,
                    fechaEntrega: d, 
                    id:t.props.match.params.id,
                    transporte: tra, 
                    planta: pla, 
                    planta_original: pla, 
                    tipoPago: tipoPago, 
                    tipoPagoOriginal: tipoPago,
                    contra_boleta: order.contra_boleta
                }
            );
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {

        let order = this.state.order;
        let flete = null;
        // if (this.props.orders) {
        if (order) {
            // order = this.props.orders.findIndex(x => x.id === this.props.match.params.id);
            // order = this.props.orders[order];
            // if (typeof order !== "undefined") {
            flete = this.props.fletes.findIndex((x) => {
                return parseInt(x.id) === parseInt(order.idFlete)
            });
            flete = this.props.fletes[flete];
            // }
        }

        // let tipos_pago = [
        //     { value: 1, label: "Contado" },
        //     { value: 2, label: "Crédito" }
        // ];

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
        if (order && order.comentarios.length > 0) {
            comentarios = order.comentarios.map((key, idx) => {
                let da = new Date(key.updated_at);
                return (
                    <li key={`c${idx}`}
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

        let stot = 0,
            ftot = 0,
            idptot = 0,
            ivatot = 0,
            subtot = 0,
            galtot = 0;

        let fE = "", fT = "", planta = "", trans;
        if (this.state.fechaEntrega) {
            fE = this.state.fechaEntrega.getDate() + "/" + (this.state.fechaEntrega.getMonth() + 1) + "/" + this.state.fechaEntrega.getFullYear();
            // fT = this.formatAMPM(this.state.fechaEntrega);
            fT = this.formatTime(this.state.fechaEntrega.getHours()) + ":" + this.formatTime(this.state.fechaEntrega.getMinutes());
        }
        if (this.state.planta) {
            planta = this.state.planta.label;
        }
        if (this.state.transporte) {
            trans = this.state.transporte.label;
        }

        // let credito = 0, credit_detail = null;
        let credit_detail = null;
        if (order) {
            if (order.credit !== null) {
                // credito = order.credit.debit - order.credit.credit;
                credit_detail = order.credit_detail;
            }
        }
        let tipos_pago = null;
        if (order) tipos_pago = order.tipos_pago;

        let vendedor = parseInt(localStorage.getItem("tp_vendedor")) > 0;
        return (
            <div className="main-container">
                {
                    this.props.credito === 1 ? (
                        <Typography variant="h3" component="h1" gutterBottom>
                            Aprobación de Pedido por Créditos
                        </Typography>
                    ) :
                        (
                            <Typography variant="h3" component="h1" gutterBottom>
                                Detalle de Órden
                            </Typography>
                        )
                }
                <div className="landing-container">
                    <Grid container spacing={2} justify="space-around">
                        <Grid item xs={12} sm={6} md={1} lg={1}>
                            <label className="label">
                                ID
                            </label>
                            {this.state.id}
                        </Grid>
                        <Grid item xs={12} sm={6} md={2} lg={2}>
                            <label className="label">
                                Fecha de Carga
                            </label>
                            {fE}
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <label className="label">
                                Hora de Carga
                            </label>
                            {fT}
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <label className="label">
                                Planta
                            </label>
                            <FormControl variant="outlined" className="form-item">
                                {planta}
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
                            {this.props.credito === 1 ? (
                                <FormControl variant="outlined" className="form-item">
                                    <Select2
                                        value={this.state.tipoPago}
                                        isSearchable={true}
                                        onChange={this.handleChangeSelect}
                                        name="tipoPago"
                                        options={tipos_pago}
                                        placeholder="*Tipo de Pago"
                                    />
                                </FormControl>
                            ) : (
                                    order ? order.tipo_pago : ""
                                )
                            }
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
                                <label className="label">
                                    Monto Por Gal
                                </label>
                                {order ? parseFloat(order.FleteXGalon).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }) : ""}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <label className="label">
                                Transporte
                            </label>
                            <FormControl variant="outlined" className="form-item">
                                {trans}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3} md={3} lg={3}>
                            <FormControl variant="outlined" className="form-item">
                                <label className="label">
                                    Vendedor
                                </label>
                                {order ? order.vendedor : ""}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={2} md={2} lg={2}>
                            <FormControl variant="outlined" className="form-item">
                                <label className="label">
                                    Entrada Mercancía
                                </label>
                                {order ? order.generar_entrada_mercancia==="1" ? "Si" :"No" : ""}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={2} md={2} lg={2}>
                            <FormControl variant="outlined" className="form-item">
                                <label className="label">
                                    Generar Factura
                                </label>
                                {order ? order.generar_factura==="1" ? "Si" :"No" : ""}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={5} md={5} lg={5}>
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
                {
                    this.props.credito === 1 ? (
                        <React.Fragment>
                            <Typography variant="h4" component="h2" gutterBottom className="margin-separation">
                                Crédito
                            </Typography>
                            {credit_detail !== null ? (
                                <React.Fragment>
                                    <div className="landing-container padding-bottom-separation">
                                        <Grid item xs={12} sm={12} md={12} lg={12}>
                                            <div className="credit-digits">
                                                Balance
                                        Q {parseFloat(credit_detail[0].Balance).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                            </div>
                                        </Grid>
                                    </div>
                                    <div className="landing-container padding-bottom-separation">
                                        <MaterialTable
                                            icons={tableIcons}
                                            columns={this.state.columns2}
                                            data={credit_detail}
                                            title="Estado de Cuenta"
                                            options={{
                                                pageSize: 5
                                            }}
                                            localization={{
                                                pagination: {
                                                    labelDisplayedRows: '{from}-{to} de {count}',
                                                    labelRowsSelect: 'Filas'
                                                },
                                                toolbar: {
                                                    nRowsSelected: '{0} filas(s) seleccionadas',
                                                    searchPlaceholder: 'Buscar'
                                                },
                                                header: {
                                                    actions: 'Estados'
                                                },
                                                body: {
                                                    emptyDataSourceMessage: 'No existen ordenes',
                                                    filterRow: {
                                                        filterTooltip: 'Filter'
                                                    }
                                                }

                                            }}
                                        />
                                    </div>
                                </React.Fragment>) : ""
                            }
                        </React.Fragment>) : ""
                }
                <Typography variant="h4" component="h2" gutterBottom className="margin-separation">
                    Comentarios
                </Typography>
                <div className="landing-container padding-bottom-separation">
                    {
                        this.props.credito === 1 ? (
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
                            </Grid>) : ""
                    }
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
                        <Grid item xs={12} sm={12} md={12} lg={12} className="center-me">
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
                        <Grid item xs={12} sm={6} md={1} lg={1} className="th">
                            <strong>Producto</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={1} lg={1} className="th goCenter">
                            <strong>Cantidad</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={1} lg={1} className="th goCenter">
                            <strong>Compartimiento</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={1} lg={1} className="th goRight">
                            <strong>Precio</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={1} lg={1} className="th goRight">
                            <strong>Subtotal</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={1} lg={1} className="th goRight">
                            <strong>Flete</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={1} lg={1} className="th goRight">
                            <strong>IDP</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={1} lg={1} className="th goRight border_right">
                            <strong>IVA</strong>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2} lg={2} className="th goRight">
                            <strong>Precio + IVA + IDP</strong>
                        </Grid>
                        {
                            !vendedor ?
                            (
                                <React.Fragment>
                                    <Grid item xs={12} sm={6} md={1} lg={1} className="th goRight">
                                        <strong>Costo + IVA + IDP</strong>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={1} lg={1} className="th goRight">
                                        <strong>Subtotal Costo</strong>
                                    </Grid>
                                </React.Fragment>
                            ) : 
                            (
                                <Grid item xs={12} sm={12} md={2} lg={2} className="th goRight"></Grid>
                            )
                        }
                        
                        {order && order.Compartimientos.length > 0
                            ? order.Compartimientos.map((key, idx) => {
                                let sub = key.Precio * key.cantidad;
                                let flete = key.cantidad * order.FleteXGalon;
                                let idp = key.IDP * key.cantidad;
                                // let neto = sub - flete - idp;
                                let subMenosIDP = sub - idp;
                                let costo = 0;
                                let iva = subMenosIDP - (subMenosIDP / 1.12);
                                key.Costo ? costo = key.Costo : costo = 0;
                                // tot += neto;
                                stot += sub;
                                ftot += flete;
                                idptot += idp;
                                ivatot += iva;
                                let subCosto = costo * key.cantidad;
                                subtot += subCosto;

                                galtot += parseInt(key.cantidad);

                                let noMargin = "";
                                if (costo >= key.Precio - order.FleteXGalon) {
                                    noMargin = "no_margin";
                                }
                                return (
                                    <React.Fragment key={`p${idx}`}>
                                        <Grid item xs={6} sm={6} md={1} lg={1} className="ch">
                                            <strong>Producto</strong>
                                            {key.Nombre}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={1} lg={1} className="ch goRight">
                                            <strong>Cantidad</strong>
                                            {this.numFormat(key.cantidad)}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={1} lg={1} className="ch goCenter">
                                            <strong>Compartimiento</strong>
                                            {key.Compartimiento !== 0 ? key.Compartimiento : ""}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={1} lg={1} className="ch goRight">
                                            <strong>Precio</strong>
                                            Q {this.numFormat(key.Precio)}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={1} lg={1} className="ch goRight">
                                            <strong>Subtotal</strong>
                                            Q {this.numFormat(sub)}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={1} lg={1} className="ch goRight">
                                            <strong>Flete</strong>
                                            Q {this.numFormat(flete)}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={1} lg={1} className="ch goRight">
                                            <strong>IDP</strong>
                                            Q {this.numFormat(idp)}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={1} lg={1} className="ch goRight border_right">
                                            <strong>IVA</strong>
                                            Q {this.numFormat(iva)}
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={2} lg={2} className={`ch goRight ${noMargin}`}>
                                            <strong>Precio + IVA + IDP</strong>
                                            Q {this.numFormat(key.Precio - order.FleteXGalon)}
                                        </Grid>
                                        {
                                            !vendedor ?
                                            (
                                                <React.Fragment>
                                                    <Grid item xs={6} sm={6} md={1} lg={1} className={`ch goRight ${noMargin}`}>
                                                        <strong>Costo + IVA + IDP</strong>
                                                        Q {this.numFormat(costo)}
                                                    </Grid>
                                                    <Grid item xs={6} sm={6} md={1} lg={1} className="ch goRight">
                                                        <strong>Subtotal Costo</strong>
                                                        Q {this.numFormat(subCosto)}
                                                    </Grid>
                                                </React.Fragment>
                                            ) : 
                                            (
                                                <Grid item xs={12} sm={12} md={2} lg={2} className="ch goRight"></Grid>
                                            )
                                        }
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

                        <Grid item xs={12} sm={12} md={1} lg={1} className="tot tot_mob goRight">
                            <strong>Totales</strong>
                        </Grid>
                        <Grid item xs={6} sm={6} md={1} lg={1} className="tot_mob goRight">
                            <strong>Total Galones</strong>
                            {galtot.toLocaleString('en-US', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            })}
                        </Grid>
                        <Grid item xs={6} sm={6} md={2} lg={2} className="tot_mob goRight">
                        </Grid>
                        <Grid item xs={6} sm={6} md={1} lg={1} className="tot_mob goRight">
                            <strong>Subtotal</strong>
                            Q {stot.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </Grid>
                        <Grid item xs={6} sm={6} md={1} lg={1} className="tot_mob tot goRight">
                            <strong>Flete</strong>
                            Q {ftot.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </Grid>
                        <Grid item xs={6} sm={6} md={1} lg={1} className="tot tot_mob goRight">
                            <strong>IDP</strong>
                            Q {idptot.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </Grid>
                        <Grid item xs={6} sm={6} md={1} lg={1} className="tot tot_mob goRight border_right">
                            <strong>IVA</strong>
                            Q {ivatot.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </Grid>
                        <Grid item xs={6} sm={6} md={1} lg={1} className="tot hideMobile goRight">

                        </Grid>
                        <Grid item xs={6} sm={6} md={1} lg={1} className="tot hideMobile goRight">

                        </Grid>
                        {
                            !vendedor ?
                            (
                                <React.Fragment>
                                    <Grid item xs={6} sm={6} md={1} lg={1} className="tot hideMobile goRight">
                                        <strong>
                                            Total
                                        </strong>
                                    </Grid>
                                    <Grid item xs={6} sm={6} md={1} lg={1} className="tot tot_mob goRight">
                                        <strong>Subtotal Costo</strong>
                                        Q {subtot.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </Grid>
                                </React.Fragment>
                            ) : 
                            (
                                <Grid item xs={12} sm={12} md={2} lg={2} className="tot tot_mob goRight"></Grid>
                            )
                        }
                    </Grid>
                </div>
                {
                    this.props.detalle === 1 ? (
                        <React.Fragment>
                            <div className="landing-container">
                                {
                                    order ? (
                                        <MaterialTable
                                            icons={tableIcons}
                                            columns={this.state.columns}
                                            data={order.log}
                                            title="Bitácora"
                                            options={{
                                                pageSize: 20
                                            }}
                                            localization={{
                                                pagination: {
                                                    labelDisplayedRows: '{from}-{to} de {count}',
                                                    labelRowsSelect: 'Filas'
                                                },
                                                toolbar: {
                                                    nRowsSelected: '{0} filas(s) seleccionadas',
                                                    searchPlaceholder: 'Buscar'
                                                },
                                                header: {
                                                    actions: 'Estados'
                                                },
                                                body: {
                                                    emptyDataSourceMessage: 'No existen ordenes',
                                                    filterRow: {
                                                        filterTooltip: 'Filter'
                                                    }
                                                }

                                            }}
                                        />
                                    ) : ""
                                }
                            </div>
                        </React.Fragment>
                    ) : ""
                }
                {
                    this.props.credito === 1 ? (
                        <Grid container spacing={2} justify="flex-end" className="padding-top-separation">
                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                {
                                    this.state.contra_boleta !=="2" ?
                                    (
                                        <React.Fragment>
                                            <Button variant="contained" color="secondary" className="pull-right" onClick={()=> this.aprobarPedido(2)}>
                                                Necesita Boleta depósito
                                            </Button>
                                            <Button variant="contained" color="primary" className="pull-right fix-right" onClick={()=> this.aprobarPedido(1)}>
                                                Aprobar
                                            </Button>
                                        </React.Fragment>
                                    ):
                                    (
                                        <Button variant="contained" color="primary" className="pull-right fix-right" onClick={()=> this.aprobarPedido(1)}>
                                            Aprobar
                                        </Button>
                                    )
                                }
                            </Grid>
                        </Grid>
                    ) : ""
                }
            </div>
        );
    }
}
export default Creditos;