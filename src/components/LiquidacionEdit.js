import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import { useFormik } from 'formik';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Select2 from 'react-select';
import { makeStyles } from '@material-ui/core/styles';
import swal from 'sweetalert';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ImageIcon from '@material-ui/icons/Image';
import DescriptionIcon from '@material-ui/icons/Description';
import MomentUtils from '@date-io/moment';
import moment from "moment";
import "moment/locale/es";
import {
    Delete
} from '@material-ui/icons/';
import Compressor from 'compressorjs';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers'
import { FormControlLabel, FormLabel, Radio, RadioGroup } from '@material-ui/core';
var parseString = require('xml2js').parseString;

moment.locale("es");
const useStyles = makeStyles((theme) => ({
    formControl: {
        marginBottom: theme.spacing(1),
        minWidth: 120,
        width: "100%",
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 2,
    },
    noLabel: {
        marginTop: theme.spacing(3),
    },
}));

const LiquidacionEdit = (props) => {
    const [id, setId] = useState(-1);
    const [presupuesto, setPresupuesto] = useState(false);
    const [fechaInicio, setFechaInicio] = useState(new Date());
    const [fechaFin, setFechaFin] = useState(new Date());
    const [totalFacturado, setTotalFacturado] = useState(0);
    const [noAplica, setNoAplica] = useState(0);
    const [reembolso, setReembolso] = useState(0);
    const [comentarios, setComentarios] = useState("");
    const [rechazoSupervisor, setRechazoSupervisor] = useState('');
    const [rechazoConta, setRechazoConta] = useState('');
    const [empresa, setEmpresa] = useState(null);
    const [disablePresupuesto, setDisablePresupuesto] = useState(false);

    const [gasto2, setGasto2] = useState(null);
    const [subgastos, setSubGastos] = useState([]);
    const [subgasto, setSubgasto] = useState(null);
    const [proveedor, setProveedor] = useState(null);
    const [moneda, setMoneda] = useState(null);
    const [fecha, setFecha] = useState(new Date());
    const [serie, setSerie] = useState("");
    const [numero, setNumero] = useState("");
    const [total, setTotal] = useState("");
    const [uuid, setUUID] = useState("");
    const [formaPago, setFormaPago] = useState("");
    const [metodoPago, setMetodoPago] = useState("");
    const [cfdi, setCfdi] = useState("");
    const [factura, setFactura] = useState("");
    const [facturaURL, setFacturaURL] = useState("");
    const [facturaContent, setFacturaContent] = useState("");
    const [xml, setXML] = useState("");
    const [xmlURL, setXMLURL] = useState("");
    const [xmlContent, setXMLContent] = useState("");
    const [ignorarXML, setIgnorarXML] = useState(false);
    const [inicial, setInicial] = useState(0);
    const [final, setFinal] = useState(9999);
    const [cantidad, setCantidad] = useState(0.0);
    // Campos factura
    const [facturas, setFacturas] = useState([]);


    const classes = useStyles();

    const checkInicialMayor = () => {
        if (parseFloat(inicial) > parseFloat(final)) {
            let content = document.createElement('div');
            content.innerHTML = "¡El kilometraje <strong>Inicial</strong> debe de ser menor al <strong>Final</strong>!";
            swal({
                title: 'Error',
                content: content,
                icon: "error",
            });
            return false;
        }
        return true;
    }
    const handleChange = event => {
        if (event.target.name === "cantidad") {
            setCantidad(event.target.value);
        }
        if (event.target.name === "numero") {
            setNumero(event.target.value);
        }
        if (event.target.name === "total") {
            setTotal(event.target.value);
        }
        if (event.target.name === "inicial") {
            setInicial(event.target.value);
        }
        if (event.target.name === "final") {
            setFinal(event.target.value);
        }
        if (event.target.name === "factura") {
            setFactura(event.target.files[0]);
            // setFacturaURL(URL.createObjectURL(event.target.files[0]));
            // setFacturaContent(event.target.files[0]);
            const image = event.target.files[0];
            new Compressor(image, {
                quality: 0.8, // 0.6 can also be used, but its not recommended to go below.
                maxWidth: 500,
                success: (compressedResult) => {
                    // Seteamos el URL de link de la comprimida
                    setFacturaURL(URL.createObjectURL(compressedResult));
                    var reader = new FileReader();
                    reader.readAsDataURL(compressedResult);
                    reader.onloadend = function () {
                        var base64data = reader.result;
                        setFacturaContent(base64data);
                    }

                },
            });
        }
        if (event.target.name === "xml") {
            if (event.target.files.length > 0) {
                setXML(event.target.files[0]);
                setXMLURL(URL.createObjectURL(event.target.files[0]));

                // Read file contents
                var reader = new FileReader();
                reader.addEventListener('load', function (e) {
                    let xmlContent = e.target.result;
                    setXMLContent(xmlContent);
                    parseString(
                        xmlContent,
                        function (err, result) {
                            let factura = result['cfdi:Comprobante']['$'];
                            let receptor = result['cfdi:Comprobante']['cfdi:Receptor'][0]['$'];
                            let emisor = result['cfdi:Comprobante']['cfdi:Emisor'][0]['$'];
                            // verificamos el ID Empresa
                            if (receptor.Rfc.trim() !== empresa[0].no_identificacion_fiscal.trim()) {
                                swal("Error", "¡Esta factura no trae el identificador fiscal correcto!", "error");
                                return;
                            }
                            // Verificamos que exista el proveedor
                            let existe = 0;
                            for (let i = 0; i < props.proveedoresApp.length; i++) {
                                if (props.proveedoresApp[i].nit === emisor.Rfc) {
                                    existe = 1;
                                    break;
                                }
                            }
                            if (existe === 0) {
                                console.log(emisor.Rfc, emisor.Nombre);
                                axios({
                                    method: 'post',
                                    url: props.url + 'proveedor',
                                    data: {
                                        nit: emisor.Rfc,
                                        nombre: emisor.Nombre.trim()
                                    },
                                    responseType: "json",
                                    headers: { "Content-Type": "application/json" }
                                })
                                    .then(function (resp) {
                                        props.loadProveedoresApp();
                                        setProveedor({
                                            value: resp.data[0].id,
                                            label: emisor.Nombre + ' (' + emisor.Rfc + ')',
                                            nombre: emisor.Nombre,
                                            nit: emisor.Rfc
                                        });
                                    })
                                    .catch(function (err) {
                                        console.log(err);
                                        swal("Error", err.response.data.msg, "error");
                                    });
                            } else {
                                for (let i = 0; i < props.proveedoresApp.length; i++) {
                                    if (props.proveedoresApp[i].nit === emisor.Rfc) {
                                        setProveedor(props.proveedoresApp[i]);
                                    }
                                }
                            }
                            setSerie(factura.Serie);
                            setNumero(factura.NoCertificado);
                            setTotal(factura.Total);
                            // setMoneda(factura.Moneda);
                            setMoneda("QTZ");
                            setFecha(factura.Fecha);
                            setFormaPago(factura.FormaPago);
                            setMetodoPago(factura.MetodoPago);
                            setCfdi(receptor.UsoCFDI);

                            let uuid = result['cfdi:Comprobante']['cfdi:Complemento'][0]['tfd:TimbreFiscalDigital'][0]['$'].UUID;
                            setUUID(uuid);

                        });
                });
                reader.readAsBinaryString(event.target.files[0]);

            }
        }
        if (event.target.name === "comentarios") {
            setComentarios(event.target.value);
        }
        if (event.target.name === "moneda") {
            setMoneda(event.target.value);
        }
        if (event.target.name === "serie") {
            setSerie(event.target.value);
        }
    };

    // Función para agregar factura a la tabla
    const agregarFactura = () => {
        let a = '';
        if (gasto2.control_kilometraje === 1 && !checkInicialMayor()) {
            return;
        }
        if (subgasto !== null && subgasto.tipo === 'cantidad' && cantidad <= 0) {
            a += "¡<strong>Cantidad</strong> incorrecta!<br><br>";
        }
        if (subgastos.length > 0 && subgasto === null) {
            a += "¡Debe seleccionar un <strong>subgasto</strong>!<br><br>";
        }
        if (gasto2 === null) {
            a += "¡Debe seleccionar un <strong>gasto</strong>!<br><br>";
        }
        if (proveedor === null) {
            a += "¡Debe seleccionar un <strong>proveedor</strong>!<br><br>";
        }
        if (moneda === null) {
            a += "¡Debe seleccionar una <strong>moneda</strong>!<br><br>";

        }
        if (numero === "") {
            a += "¡Debe ingresar el <strong>número</strong> de la factura!<br><br>";
        }
        if (total === "") {
            a += "¡Debe ingresar el <strong>total</strong> de la factura!<br><br>";
        }
        if (empresa[0].maneja_xml === 1 && ignorarXML !== 1 && uuid === "") {
            a += "¡Debe ingresar el <strong>UUID</strong> de la factura!<br><br>";
        }
        if (empresa[0].maneja_xml === 1 && ignorarXML !== 1 && formaPago === "") {
            a += "¡Debe ingresar la <strong>forma de pago</strong> de la factura!<br><br>";
        }
        if (empresa[0].maneja_xml === 1 && ignorarXML !== 1 && metodoPago === "") {
            a += "¡Debe ingresar el <strong>método de pago</strong> de la factura!<br><br>";
        }
        if (facturaContent === "") {
            a += "¡Debe agregar una <strong>copia</strong> de la factura!<br><br>";
        }
        if (empresa[0].maneja_xml === 1 && ignorarXML !== 1 && xmlContent === "") {
            a += "¡Debe agregar el <strong>XML</strong> de la factura!<br><br>";
        }

        if (a === "") {
            let temp = [...facturas];

            let f = new Date(fecha);
            f = f.getDate() + '/' + ("0" + (f.getMonth() + 1)).slice(-2) + "/" + f.getFullYear();
            let t = [
                gasto2.value,
                gasto2.label,
                subgasto !== null ? subgasto.value : "",
                subgasto !== null ? subgasto.label : "",
                proveedor.value,
                proveedor.label,
                f,//Fecha
                total,
                moneda,
                serie,
                numero,
                uuid,
                formaPago,
                metodoPago,
                cfdi,
                inicial,
                final,
                cantidad,
                facturaContent,
                xmlContent,
            ];
            temp.push(t);
            setFacturas(temp);
            // Reset form
            setGasto2(null);
            let tot = parseFloat(totalFacturado) + parseFloat(total);
            setTotalFacturado(tot);
        } else {
            let content = document.createElement('div');
            content.innerHTML = a;
            swal({
                title: 'Error',
                content: content,
                icon: "error",
            })
        }

    }

    // Pass the useFormik() hook initial form values and a submit function that will
    // be called when the form is submitted
    const formik = useFormik({
        initialValues: {
        },
        onSubmit: values => {
            if (
                presupuesto === false ||
                typeof fechaInicio === "undefined" ||
                typeof fechaFin === "undefined"
            ) {
                swal("Error", "¡Debe llenar todos los campos!", "error");
            } else {
                values.liquidacion_id = id;
                values.au_gasto_label = presupuesto.label;
                values.au_gasto_id = presupuesto.value;
                values.fecha_inicio = fechaInicio;
                values.fecha_fin = fechaFin;
                values.comentario = comentarios;
                values.au_usuario_id = localStorage.getItem("lu_id");

                let data = JSON.stringify(values);

                if (id === -1) {
                    axios({
                        method: 'post',
                        url: props.url + 'liquidacion',
                        data,
                        responseType: "json",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(function (resp) {
                            props.loadLiquidaciones();
                            props.history.push(`/edit-liquidacion/${resp.data}`);
                        })
                        .catch(function (err) {
                            console.log(err);
                            swal("Error", err.response.data.msg, "error");
                        });
                } else {
                    axios({
                        method: 'put',
                        url: props.url + 'liquidacion/' + id,
                        data,
                        responseType: "json",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(function (resp) {
                            swal("Éxito", resp.data.msg, "success");
                            props.loadLiquidaciones();
                            props.history.push(`/liquidaciones`);
                        })
                        .catch(function (err) {
                            console.log(err);
                            swal("Error", err.response.data.msg, "error");
                        });
                }
            }

        },
    });

    const handleChangeSelect = (option, b) => {
        if (b.name === "presupuesto") {
            setPresupuesto(option);
            // Get the empresa to get the currency
            axios({
                method: 'get',
                url: props.url + 'empresa-by-presupuesto/' + option.value,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    setEmpresa(resp.data);
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
        if (b.name === "gasto2") {
            setGasto2(option);
            setIgnorarXML(option.ignorar_xml);
            axios({
                method: 'get',
                url: props.url + 'sub-gastos/' + option.value,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    setSubGastos(resp.data);
                })
                .catch(function (err) {
                    console.log(err);
                });
            setSubgasto(null);
            setProveedor(null);
            setMoneda(null);
            setFecha(new Date());
            setSerie("");
            setNumero("");
            setTotal("");
            setUUID("");
            setFormaPago("");
            setMetodoPago("");
            setCfdi("");
            setFactura("");
            setFacturaURL("");
            setFacturaContent("");
            setXML("");
            setXMLURL("");
            setXMLContent("");
            setInicial(0);
            setFinal(9999);
            setCantidad(0);
        }
        if (b.name === "subgasto") {
            setSubgasto(option);
        }
        if (b.name === "proveedor") {
            setProveedor(option);
        }
    }

    useEffect(() => {
        if (typeof props.match.params.id !== "undefined") {
            setDisablePresupuesto(true);
            setId(props.match.params.id);
            axios({
                method: 'get',
                url: props.url + 'liquidacion/' + props.match.params.id,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    setPresupuesto(
                        {
                            "value": resp.data.au_gasto_id,
                            "label": resp.data.au_gasto_label
                        }
                    );
                    // Get the empresa to get the currency
                    axios({
                        method: 'get',
                        url: props.url + 'empresa-by-presupuesto/' + resp.data.au_gasto_id,
                        responseType: "json",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(function (resp) {
                            setEmpresa(resp.data);
                        })
                        .catch(function (err) {
                            console.log(err);
                        });

                    setComentarios(resp.data.comentario);

                })
                .catch(function (err) {
                    console.log(err);
                    if (err.response)
                        swal("Error", err.response.data.msg, "error");
                });
        }
    }, []);

    const removeFactura = (idx) => {
        if (idx > -1) {
            swal({
                title: "¿Esta seguro?",
                text: "¡Esta operación no se puede revertir!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then((willDelete) => {
                    if (willDelete) {
                        let e = [...facturas];
                        e.splice(idx, 1);
                        setFacturas(e);
                    }
                });
        }
    }


    return (
        <div className="main-container">
            <Typography variant="h3" component="h1" gutterBottom>
                <Link className="link" to="/liquidaciones">
                    <ArrowBackIosIcon />
                </Link>
                {
                    typeof props.match.params.id !== "undefined" ? "Editar liquidación" : "Crear liquidación"
                }
            </Typography>
            <div className="empresa-container">
                <form onSubmit={formik.handleSubmit}>
                    <div className="full">
                        <h2>Datos Liquidación usuario: {localStorage.getItem("lu_n")}</h2>
                        <Grid container spacing={3}>
                            <Grid item xs={4}>
                                <FormControl variant="outlined" className="form-item">
                                    <label htmlFor="presupuesto" className="manual">
                                        Seleccione Presupuesto
                                    </label>
                                    <Select2
                                        isSearchable={true}
                                        isDisabled={disablePresupuesto}
                                        onChange={handleChangeSelect}
                                        value={presupuesto}
                                        name="presupuesto"
                                        id="presupuesto"
                                        options={props.presupuestos}
                                        placeholder="*Presupuestos"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl className={classes.formControl}>
                                    <label htmlFor="fechaInicio" className="manual">
                                        Fecha Inicio
                                    </label>
                                    <MuiPickersUtilsProvider utils={MomentUtils} locale={`es`}>
                                        <DatePicker
                                            value={fechaInicio}
                                            onChange={setFechaInicio}
                                            maxDate={fechaFin}
                                            format="DD/MM/yyyy"
                                            maxDateMessage={`La fecha no puede ser mayor a la fecha Final`}
                                        />
                                    </MuiPickersUtilsProvider>
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl className={classes.formControl}>
                                    <label htmlFor="fechaFin" className="manual">
                                        Fecha Fin
                                    </label>
                                    <MuiPickersUtilsProvider utils={MomentUtils}>
                                        <DatePicker
                                            value={fechaFin}
                                            onChange={setFechaFin}
                                            minDate={fechaInicio}
                                            minDateMessage={`La fecha no puede ser menor a la fecha Inicial`}
                                            format="DD/MM/yyyy"
                                        />
                                    </MuiPickersUtilsProvider>
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl className={classes.formControl}>
                                    <TextField
                                        id="totalFacturado"
                                        name="totalFacturado"
                                        label="Total Facturado"
                                        type="text"
                                        value={parseFloat(totalFacturado).toFixed(2)}
                                        disabled={true}
                                        className="centertext"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl className={classes.formControl}>
                                    <TextField
                                        id="noAplica"
                                        name="noAplica"
                                        label="No aplica pago"
                                        type="text"
                                        value={parseFloat(noAplica).toFixed(2)}
                                        disabled={true}
                                        className="centertext"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl className={classes.formControl}>
                                    <TextField
                                        id="reembolso"
                                        name="reembolso"
                                        label="Reembolso"
                                        type="text"
                                        value={parseFloat(reembolso).toFixed(2)}
                                        disabled={true}
                                        className="centertext"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl className={classes.formControl}>
                                    <TextField
                                        id="comentarios"
                                        name="comentarios"
                                        label="Comentarios"
                                        type="text"
                                        value={comentarios}
                                        onChange={handleChange}
                                        multiline
                                    />
                                </FormControl>
                            </Grid>
                            {
                                rechazoSupervisor !== '' ?
                                    (
                                        <Grid item xs={4}>
                                            <FormControl className={classes.formControl}>
                                                <TextField
                                                    id="rechazoSupervisor"
                                                    name="rechazoSupervisor"
                                                    label="Rechazo supervisor"
                                                    value={rechazoSupervisor}
                                                    type="text"
                                                    multiline
                                                    disabled={true}
                                                />
                                            </FormControl>
                                        </Grid>
                                    ) : ""
                            }

                            {
                                rechazoConta !== '' ?
                                    (
                                        <Grid item xs={4}>
                                            <FormControl className={classes.formControl}>
                                                <TextField
                                                    id="rechazoConta"
                                                    name="rechazoConta"
                                                    label="Rechazo contabilidad"
                                                    value={rechazoConta}
                                                    type="text"
                                                    multiline
                                                    disabled={true}
                                                />
                                            </FormControl>
                                        </Grid>
                                    ) : ""
                            }

                        </Grid>
                    </div>
                </form>

                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Button color="secondary" variant="contained" className="full-button" fullWidth type="text" onClick={() => formik.submitForm()}>
                            Guardar
                        </Button>
                    </Grid>
                    {
                        id !== -1 ?
                            (
                                <Grid item xs={6}>
                                    <Button color="primary" variant="contained" className="full-button" fullWidth type="text" onClick={() => formik.submitForm()}>
                                        Enviar a Aprobación
                                    </Button>
                                </Grid>

                            ) : ""
                    }
                </Grid>
            </div>
            {
                id !== -1 ?
                    (
                        <div className="empresa-container">
                            <div className="full">
                                <Typography variant="h4" component="h6" gutterBottom>
                                    Facturas
                                </Typography>
                                <div className="table-container">
                                    <table className="detail-table">
                                        <thead>
                                            <tr>
                                                <th>Gasto</th>
                                                <th>Sub Gasto</th>
                                                <th>Proveedor</th>
                                                <th>Fecha</th>
                                                <th>Total</th>
                                                <th>Moneda</th>
                                                <th>Serie</th>
                                                <th>Número</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        {
                                            facturas && facturas.length > 0
                                                ?
                                                (
                                                    <tbody>
                                                        {
                                                            facturas.map((key, idx) => (
                                                                <tr key={idx}>
                                                                    <td>
                                                                        {key[1]}
                                                                    </td>
                                                                    <td>
                                                                        {key[3]}
                                                                    </td>
                                                                    <td>
                                                                        {key[5]}
                                                                    </td>
                                                                    <td>
                                                                        {key[6]}
                                                                    </td>
                                                                    <td>
                                                                        {key[7]}
                                                                    </td>
                                                                    <td>
                                                                        {key[8]}
                                                                    </td>
                                                                    <td>
                                                                        {key[9]}
                                                                    </td>
                                                                    <td>
                                                                        {key[10]}
                                                                    </td>
                                                                    <td>
                                                                        <Button
                                                                            color="secondary"
                                                                            variant="contained"
                                                                            type="button"
                                                                            onClick={() => removeFactura(idx)}
                                                                        >
                                                                            <Delete />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                )
                                                :
                                                (
                                                    <tbody></tbody>
                                                )
                                        }
                                    </table>
                                </div>

                                <br />
                                <br />
                                <br />
                                <hr />
                                <br />
                                <Typography variant="h4" component="h6" gutterBottom>
                                    Agregar Factura
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={4}>
                                        <FormControl variant="outlined" className="form-item">
                                            <label htmlFor="gasto" className="manual">
                                                Seleccione categoría de gasto
                                            </label>
                                            <Select2
                                                isSearchable={true}
                                                onChange={handleChangeSelect}
                                                value={gasto2}
                                                name="gasto2"
                                                id="gasto2"
                                                options={props.gastos}
                                                placeholder="*Categoría de Gasto"
                                            />
                                        </FormControl>
                                    </Grid>
                                    {
                                        gasto2 !== null ?
                                            (
                                                <React.Fragment>
                                                    <Grid item xs={4}>
                                                        {
                                                            subgastos.length > 0 ?
                                                                (
                                                                    <FormControl variant="outlined" className="form-item">
                                                                        <label htmlFor="subgasto" className="manual">
                                                                            Seleccione sub categoría de gasto
                                                                        </label>
                                                                        <Select2
                                                                            isSearchable={true}
                                                                            onChange={handleChangeSelect}
                                                                            value={subgasto}
                                                                            name="subgasto"
                                                                            id="subgasto"
                                                                            options={subgastos}
                                                                            placeholder="Subcategoría de Gasto"
                                                                        />
                                                                    </FormControl>
                                                                ) : ""
                                                        }
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <FormControl variant="outlined" className="form-item">
                                                            <label htmlFor="proveedor" className="manual">
                                                                Seleccione proveedor
                                                            </label>
                                                            <Select2
                                                                isSearchable={true}
                                                                onChange={handleChangeSelect}
                                                                value={proveedor}
                                                                name="proveedor"
                                                                id="proveedor"
                                                                options={props.proveedoresApp}
                                                                placeholder="*Seleccione Proveedor"
                                                                isDisabled={empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1}
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                    {
                                                        gasto2 && gasto2.control_kilometraje === 1 ?
                                                            (
                                                                <React.Fragment>
                                                                    <Grid item xs={4}>
                                                                        <label htmlFor="inicial" className="manual">
                                                                            Kilometraje Inicial
                                                                        </label>
                                                                        <FormControl className={classes.formControl}>
                                                                            <TextField
                                                                                name="inicial"
                                                                                type="text"
                                                                                value={inicial}
                                                                                onChange={handleChange}
                                                                                onBlur={checkInicialMayor}
                                                                            />
                                                                        </FormControl>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <label htmlFor="final" className="manual">
                                                                            Kilometraje Final
                                                                        </label>
                                                                        <FormControl className={classes.formControl}>
                                                                            <TextField
                                                                                name="final"
                                                                                type="text"
                                                                                value={final}
                                                                                onChange={handleChange}
                                                                                onBlur={checkInicialMayor}
                                                                            />
                                                                        </FormControl>
                                                                    </Grid>
                                                                </React.Fragment>
                                                            ) : ""
                                                    }

                                                    {
                                                        subgasto !== null && subgasto.tipo === 'cantidad' ?
                                                            (
                                                                <Grid item xs={4}>
                                                                    <label htmlFor="cantidad" className="manual">
                                                                        Cantidad
                                                                    </label>
                                                                    <FormControl className={classes.formControl}>
                                                                        <TextField
                                                                            name="cantidad"
                                                                            type="text"
                                                                            value={cantidad}
                                                                            onChange={handleChange}
                                                                        />
                                                                    </FormControl>
                                                                </Grid>
                                                            ) :
                                                            gasto2 && gasto2.control_kilometraje === 1 ?
                                                                (
                                                                    <Grid item xs={4}>
                                                                        &nbsp;
                                                                    </Grid>
                                                                ) : ""
                                                    }

                                                    <Grid item xs={4}>
                                                        <FormControl component="fieldset">
                                                            <FormLabel component="legend">* Moneda</FormLabel>
                                                            <RadioGroup
                                                                aria-label="moneda"
                                                                name="moneda"
                                                                value={moneda}
                                                                onChange={handleChange}
                                                            >
                                                                <FormControlLabel
                                                                    value="usd"
                                                                    control={<Radio />}
                                                                    label="USD"
                                                                    disabled={empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1}
                                                                />
                                                                <FormControlLabel
                                                                    value={empresa ? empresa[0].moneda_local : 'MONEDA LOCAL'}
                                                                    control={<Radio />}
                                                                    label={empresa ? empresa[0].moneda_local : 'Otro'}
                                                                    disabled={empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1}
                                                                />
                                                            </RadioGroup>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <FormControl className={classes.formControl}>
                                                            <label htmlFor="fechaFactura" className="manual">
                                                                * Fecha
                                                            </label>
                                                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                                                <DatePicker
                                                                    format="DD/MM/yyyy"
                                                                    value={fecha}
                                                                    onChange={setFecha}
                                                                    disabled={empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1}
                                                                />
                                                            </MuiPickersUtilsProvider>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <label htmlFor="serie" className="manual">
                                                            &nbsp;
                                                        </label>
                                                        <FormControl className={classes.formControl}>
                                                            <TextField
                                                                name="serie"
                                                                label="Serie"
                                                                type="text"
                                                                value={serie}
                                                                onChange={handleChange}
                                                                disabled={empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1}
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <FormControl className={classes.formControl}>
                                                            <TextField
                                                                id="numero"
                                                                name="numero"
                                                                label="* Número"
                                                                type="text"
                                                                value={numero}
                                                                onChange={handleChange}
                                                                disabled={empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1}
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <FormControl className={classes.formControl}>
                                                            <TextField
                                                                id="total"
                                                                name="total"
                                                                label="* Total"
                                                                type="number"
                                                                value={total}
                                                                onChange={handleChange}
                                                                disabled={empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1}
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                    {
                                                        empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1 ?
                                                            (
                                                                <React.Fragment>
                                                                    <Grid item xs={4}>
                                                                        <FormControl className={classes.formControl}>
                                                                            <TextField
                                                                                id="uuid"
                                                                                name="uuid"
                                                                                label="* UUID"
                                                                                type="text"
                                                                                disabled={empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1}
                                                                                value={uuid}
                                                                                onChange={handleChange}
                                                                            />
                                                                        </FormControl>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <FormControl variant="outlined" className="form-item">
                                                                            <label htmlFor="formaPago" className="manual">
                                                                                * Forma de Pago
                                                                            </label>
                                                                            <TextField
                                                                                id="formaPago"
                                                                                name="formaPago"
                                                                                value={formaPago}
                                                                                onChange={setFormaPago}
                                                                                type="text"
                                                                                disabled={empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1}
                                                                            />
                                                                        </FormControl>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <FormControl variant="outlined" className="form-item">
                                                                            <label htmlFor="metodoPago" className="manual">
                                                                                * Método de Pago
                                                                            </label>
                                                                            <TextField
                                                                                id="metodoPago"
                                                                                name="metodoPago"
                                                                                value={metodoPago}
                                                                                onChange={setMetodoPago}
                                                                                type="text"
                                                                                disabled={empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1}
                                                                            />
                                                                        </FormControl>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <FormControl variant="outlined" className="form-item">
                                                                            <label htmlFor="cfdi" className="manual">
                                                                                Usó CFDI
                                                                            </label>
                                                                            <TextField
                                                                                id="cfdi"
                                                                                name="cfdi"
                                                                                value={cfdi}
                                                                                onChange={setCfdi}
                                                                                type="text"
                                                                                disabled={empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1}
                                                                            />
                                                                        </FormControl>
                                                                    </Grid>
                                                                </React.Fragment>
                                                            ) : ""
                                                    }
                                                    <Grid item xs={4}>
                                                        <FormControl className={classes.formControl}>
                                                            <TextField
                                                                id="comentarios2"
                                                                name="comentarios2"
                                                                label="Comentarios"
                                                                type="text"
                                                                multiline
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <Button
                                                            variant="contained"
                                                            component="label"
                                                        >
                                                            <ImageIcon />
                                                            {factura !== "" ? factura.name : "Cargar Imagen de Factura"}
                                                            <input
                                                                type="file"
                                                                name="factura"
                                                                hidden
                                                                onChange={handleChange}
                                                                accept="application/pdf,image/*"
                                                            />
                                                        </Button>
                                                        {
                                                            facturaURL !== '' ?
                                                                (
                                                                    <a className="file-link" href={facturaURL} target="_blank" rel="noreferrer">Ver Factura</a>
                                                                ) : ""
                                                        }
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        {
                                                            empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1 ?
                                                                (
                                                                    <Button
                                                                        variant="contained"
                                                                        component="label"
                                                                    >
                                                                        <DescriptionIcon />
                                                                        {xml !== "" ? xml.name : "Cargar XML"}
                                                                        <input
                                                                            type="file"
                                                                            name="xml"
                                                                            hidden
                                                                            onChange={handleChange}
                                                                            accept=".xml"
                                                                        />
                                                                    </Button>
                                                                ) : ""
                                                        }
                                                        {
                                                            xmlURL !== '' ?
                                                                (
                                                                    <a className="file-link" href={xmlURL} target="_blank" rel="noreferrer">Ver XML</a>
                                                                ) : ""
                                                        }
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Button
                                                            color="secondary"
                                                            variant="contained"
                                                            className="full-button"
                                                            fullWidth
                                                            type="text"
                                                            onClick={agregarFactura}
                                                        >
                                                            Agregar Factura
                                                        </Button>
                                                    </Grid>
                                                </React.Fragment>
                                            ) : ""
                                    }

                                </Grid>
                            </div>
                        </div>
                    ) :
                    ""
            }
        </div>
    );
};
export default LiquidacionEdit;
