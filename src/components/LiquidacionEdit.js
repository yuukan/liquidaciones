import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { useFormik } from 'formik';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Select2 from 'react-select';
import swal from 'sweetalert';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ImageIcon from '@material-ui/icons/Image';
import DescriptionIcon from '@material-ui/icons/Description';
import MomentUtils from '@date-io/moment';
import Cookies from 'js-cookie';
import {
    endOfWeek,
    format,
    parseISO,
    startOfWeek,
    subDays,
    startOfMonth,
    endOfMonth
} from 'date-fns';
import moment from "moment";
import "moment/locale/es";
import {
    Delete,
    Edit
} from '@material-ui/icons/';
import Compressor from 'compressorjs';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers'
import { Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormLabel, LinearProgress, Modal, Radio, RadioGroup } from '@material-ui/core';
const CfdiToJson = require('cfdi-to-json');

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
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
        width: `80%`
    };
}

const LiquidacionEdit = (props) => {
    const [refresh, setRefresh] = useState(0);
    const [id, setId] = useState(-1);
    const [presupuesto, setPresupuesto] = useState(false);
    const [fechaInicio, setFechaInicio] = useState(new Date());
    const [fechaFin, setFechaFin] = useState(new Date());
    const [totalFacturado, setTotalFacturado] = useState(0);
    const [noAplica, setNoAplica] = useState(0);
    const [reembolso, setReembolso] = useState(0);
    const [comentarios, setComentarios] = useState("");
    const [comentarios2, setComentarios2] = useState("");
    const [rechazoSupervisor, setRechazoSupervisor] = useState('');
    const [rechazoConta, setRechazoConta] = useState('');
    const [resultados_subida_sap, setResultados_subida_sap] = useState('');
    const [empresa, setEmpresa] = useState(null);
    const [disablePresupuesto, setDisablePresupuesto] = useState(false);
    const [estado, setEstado] = useState(0);
    const [nombreUsuario, setNombreUsuario] = useState('');

    const [edit, setEdit] = useState(null);
    const [gastos, setGastos] = useState(null);
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
    const [open, setOpen] = useState(false);
    const [openCuadrar, setOpenCuadrar] = useState(false);
    const [nombreAdd, setNombreAdd] = useState("");
    const [nitAdd, setNitAdd] = useState("");
    // Campos factura
    const [facturas, setFacturas] = useState([]);
    const [cuadrar, setCuadrar] = useState([]);
    const [tipo_proveedor, setTipoProveedor] = useState("PJ");
    const [loading, setLoading] = useState(false);
    const [uid, setUID] = useState(Cookies.get('lu_id'));
    const [rejected, setRejected] = useState(false);
    const [razon_rechazo, setRazon] = useState("");

    const classes = useStyles();
    // getModalStyle is not a pure function, we roll the style only on the first render
    const [modalStyle] = React.useState(getModalStyle);

    const handleClose = () => {
        setOpen(false);
    }
    const handleAgregar = () => {
        if (nombreAdd === "" || nitAdd === "" || tipo_proveedor === "") {
            swal("Error", "¡Todos los campos son requeridos!", "error");
        } else {
            setLoading(true);
            axios({
                method: 'post',
                url: props.url + 'proveedor',
                data: {
                    nit: nitAdd,
                    nombre: nombreAdd,
                    tipo_proveedor: tipo_proveedor,
                    au_empresa_id: empresa[0].id
                },
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    props.loadProveedoresApp(empresa[0].id);
                    if (resp.data.res === -1) {
                        swal("Error", "¡Ya exite un proveedor con ese número de identificación fiscal!", "error");
                    } else {
                        setProveedor({
                            value: resp.data[0].id,
                            label: nombreAdd + ' (' + nitAdd + ')',
                            nombre: nombreAdd,
                            nit: nitAdd
                        });
                        setNombreAdd("");
                        setNitAdd("");
                        setOpen(false);
                    }
                    setLoading(false);
                })
                .catch(function (err) {
                    console.log(err);
                    swal("Error", err.response.data.msg, "error");
                });
        }
    }

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

    const makeblob = (dataURL) => {
        const BASE64_MARKER = ';base64,';
        const parts = dataURL.split(BASE64_MARKER);
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
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
        if (event.target.name === "nombreAdd") {
            setNombreAdd(event.target.value);
        }
        if (event.target.name === "nitAdd") {
            setNitAdd(event.target.value);
        }
        if (event.target.name === "factura") {

            if (event.target.files.length > 0) {
                setFactura(event.target.files[0]);
                if (event.target.files[0].name.split(".")[1] !== "pdf") {
                    const image = event.target.files[0];
                    new Compressor(image, {
                        quality: 0.6, // 0.6 can also be used, but its not recommended to go below.
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
                } else {
                    setFacturaURL(URL.createObjectURL(event.target.files[0]));
                    var reader = new FileReader();
                    reader.readAsDataURL(event.target.files[0]);
                    reader.addEventListener('load', function (e) {
                        let json = JSON.stringify({ dataURL: reader.result });
                        let fileURL = JSON.parse(json).dataURL;

                        setFacturaContent(fileURL);
                    });
                }
            }
        }
        if (event.target.name === "xml") {
            if (event.target.files.length > 0) {
                setXML(event.target.files[0]);
                setXMLURL(URL.createObjectURL(event.target.files[0]));

                // Read file contents
                reader = new FileReader();
                reader.addEventListener('load', function (e) {
                    let xmlContent = e.target.result;
                    setXMLContent(xmlContent);
                    let result = CfdiToJson.parse({
                        contentXML: xmlContent
                    });
                    console.log(result);
                    let receptor = result.receptor;
                    let emisor = result.emisor;
                    // verificamos el ID Empresa
                    if (receptor.rfc.trim() !== empresa[0].no_identificacion_fiscal.trim()) {
                        swal("Error", "¡Esta factura no trae el identificador fiscal correcto!", "error");
                        return;
                    }
                    let existe = 0;
                    for (let i = 0; i < props.proveedoresApp.length; i++) {
                        if (props.proveedoresApp[i].nit === emisor.rfc) {
                            existe = 1;
                            break;
                        }
                    }
                    // Verificamos que exista el proveedor
                    if (existe === 0) {
                        setLoading(true);
                        axios({
                            method: 'post',
                            url: props.url + 'proveedor',
                            data: {
                                nit: emisor.rfc,
                                nombre: emisor.nombre.trim(),
                                au_empresa_id: empresa[0].id
                            },
                            responseType: "json",
                            headers: { "Content-Type": "application/json" }
                        })
                            .then(function (resp) {
                                props.loadProveedoresApp(empresa[0].id);
                                setProveedor({
                                    value: resp.data[0].id,
                                    label: emisor.nombre + ' (' + emisor.rfc + ')',
                                    nombre: emisor.nombre,
                                    nit: emisor.rfc,
                                    au_empresa_id: empresa[0].id
                                });
                                setLoading(false);
                            })
                            .catch(function (err) {
                                console.log(err);
                                swal("Error", err.response.data.msg, "error");
                                setLoading(false);
                            });
                    } else {
                        for (let i = 0; i < props.proveedoresApp.length; i++) {
                            if (props.proveedoresApp[i].nit === emisor.rfc) {
                                setProveedor(props.proveedoresApp[i]);
                            }
                        }
                    }
                    let serie = typeof result.serie !== "undefined" ? result.serie : "";
                    setSerie(serie);
                    setNumero(result.noCertificado);
                    setTotal(result.total);
                    if (result.moneda === "MXN") {
                        result.moneda = "MXP";
                    }
                    setMoneda(result.moneda);
                    setFecha(result.fecha);
                    setFormaPago(result.formaPago);
                    setMetodoPago(result.metodoPago);
                    setCfdi(receptor.usoCFDI);

                    setUUID(result.timbreFiscal.uuid);
                });
                reader.readAsBinaryString(event.target.files[0]);

            }
        }
        if (event.target.name === "comentarios") {
            setComentarios(event.target.value);
        }
        if (event.target.name === "comentarios2") {
            setComentarios2(event.target.value);
        }
        if (event.target.name === "moneda") {
            setMoneda(event.target.value);
        }
        if (event.target.name === "tipo_proveedor") {
            setTipoProveedor(event.target.value);
        }
        if (event.target.name === "serie") {
            setSerie(event.target.value);
        }
    };

    // round half away from zero
    const round = (num, decimalPlaces = 0) => {
        if (num < 0)
            return -round(-num, decimalPlaces);
        var p = Math.pow(10, decimalPlaces);
        var n = num * p;
        var f = n - Math.floor(n);
        var e = Number.EPSILON * n;

        // Determine whether this fraction is a midpoint value.
        return (f >= .5 - e) ? Math.ceil(n) / p : Math.floor(n) / p;
    }

    // Función para agregar factura a la tabla
    const agregarFactura = () => {

        // let f = new Date(fecha);
        let ffactura;
        if (typeof fecha === "object") {
            if (fecha instanceof moment) {
                ffactura = new Date(fecha);
            } else {
                ffactura = fecha;
            }
        } else if (typeof fecha === "string" && fecha.includes("T")) {
            ffactura = new Date(fecha);
        } else {
            ffactura = new Date(fecha + " 12:00:00");
        }

        let fini = subDays(new Date(fechaInicio), empresa[0].dias_atraso_facturacion_ruta);
        // dias_atraso_facturacion_depreciacion

        // Obtenemos la info para los calculos
        let monto_maximo_factura = 0;
        let tipo_gasto_nombre = "";
        for (let i = 0; i < props.presupuestos.length; i++) {
            if (parseInt(props.presupuestos[i].value) === parseInt(presupuesto.value)) {
                monto_maximo_factura = props.presupuestos[i].monto_maximo_factura;
                tipo_gasto_nombre = props.presupuestos[i].tipo_gasto_nombre;
            }
        }

        // Si es depreciación recalculamos los días de atraso
        if (tipo_gasto_nombre.toLowerCase() === "depreciación") {
            fini = subDays(new Date(fechaInicio), empresa[0].dias_atraso_facturacion_depreciacion);
        }


        let start = startOfWeek(ffactura, { weekStartsOn: 1 });
        let end = endOfWeek(ffactura, { weekStartsOn: 1 });

        if (gasto2.frecuencia_codigo === "1") {
            start = startOfMonth(ffactura);
            end = endOfMonth(ffactura);
        }

        if (ffactura < fini) {
            let content = document.createElement('div');
            content.innerHTML = "¡La <strong>fecha de la factura</strong> no es válida para este período!";
            swal({
                title: 'Error',
                content: content,
                icon: "error",
            });
            return false;
        }
        let a = '';
        if (gasto2.control_kilometraje === 1 && !checkInicialMayor()) {
            return;
        }
        if (subgasto !== null && subgasto.exento === 1 && subgasto.tipo === 'cantidad' && cantidad <= 0) {
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
        if (total > monto_maximo_factura) {
            a += "¡El <strong>total</strong> es mayor a la cantidad máxima por factura!<br><br>";
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

            // ffactura
            // let f = fecha.split("-");
            // f = f[2] + "/" + f[1] + "/" + f[0];

            // let ini = new Date(start + "12:00");
            // ini = ini.getFullYear() + '-' + ("0" + (ini.getMonth() + 1)).slice(-2) + "-" + ini.getDate();
            // let fin = new Date(end + "12:00");
            // fin = fin.getFullYear() + '-' + ("0" + (fin.getMonth() + 1)).slice(-2) + "-" + fin.getDate();


            let e = 0;
            if (subgasto !== null) {
                if (subgasto.valor > 0) {
                    // Quitar impuesto + porcentaje exento
                    let a = parseFloat(total) / (1 + (empresa[0].valor_impuesto / 100) + (subgasto.valor / 100));
                    // Calculo Monto + Impuesto del Resultado
                    let b = round(a * (1 + (empresa[0].valor_impuesto / 100)), 2);
                    e = parseFloat(total) - b;
                }
            }

            let exento = subgasto !== null ?
                subgasto.tipo === 'cantidad' ?
                    subgasto.valor !== "" ?
                        round((cantidad * parseFloat(subgasto.valor)), 2)
                        : 0
                    : round(e, 2)
                : 0;


            let t = [
                gasto2.value,
                gasto2.label,
                subgasto !== null ? subgasto.value : "",
                subgasto !== null ? subgasto.label : "",
                proveedor.value,
                proveedor.label,
                ffactura.toLocaleString('en-US').split(",")[0],//Fecha
                total,
                moneda,
                serie,
                numero, //10
                uuid,
                formaPago,
                metodoPago,
                cfdi,
                inicial,
                final,
                cantidad,
                facturaContent,
                xmlContent,
                comentarios2, //20
                gasto2.frecuencia_codigo,
                start.toLocaleString('en-US').split(",")[0],
                end.toLocaleString('en-US').split(",")[0],
                gasto2.au_presupuesto_id,//24
                gasto2.linea, //25
                gasto2.tipo, //26
                gasto2.presupuesto_monto, //27
                subgasto !== null ? subgasto.exento : 0, //28
                exento, //29
                parseFloat(total) - exento, //30
                Cookies.get('lu_id'), //31
                razon_rechazo //32
            ];

            let id_factura = -1;
            if (edit !== null) {
                id_factura = temp[edit][22];
            }

            setLoading(true);
            axios({
                method: 'post',
                url: props.url + 'calculo-factura/' + id + "/" + id_factura,
                data: t,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    setRefresh(refresh + 1);
                    // // Reset form
                    setGasto2(null);
                    setComentarios2("");
                })
                .catch(function (err) {
                    console.log(err);
                    swal("Error", err.response.data.msg, "error");
                });

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
                values.au_usuario_id = uid;
                values.total_facturado = totalFacturado;
                values.no_aplica = noAplica;
                values.reembolso = reembolso;

                let data = JSON.stringify(values);

                if (id === -1) {
                    setLoading(true);
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
                            window.location.reload();
                            setLoading(false);
                        })
                        .catch(function (err) {
                            console.log(err);
                            swal("Error", err.response.data.msg, "error");
                            setLoading(false);
                        });
                } else {
                    setLoading(true);
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
                            setLoading(false);
                        })
                        .catch(function (err) {
                            console.log(err);
                            swal("Error", err.response.data.msg, "error");
                            setLoading(false);
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
            // Get the Gastos
            axios({
                method: 'get',
                url: props.url + 'liquidacion-gastos/' + Cookies.get('lu_id') + '/' + option.value,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    setGastos(resp.data);
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
        if (b.name === "gasto2") {
            setGasto2(option);
            setIgnorarXML(option.ignorar_xml);
            setLoading(true);
            axios({
                method: 'get',
                url: props.url + 'sub-gastos/' + option.value,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    setSubGastos(resp.data);
                    setLoading(false);
                })
                .catch(function (err) {
                    console.log(err);
                    setLoading(false);
                });
            setSubgasto(null);
            setProveedor(null);
            setMoneda(empresa[0].moneda_local);
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
            console.log(option);
        }
        if (b.name === "proveedor") {
            setProveedor(option);
        }

    }

    const sumTotales = (facturas) => {
        let totalFacturado = 0;
        let noAplica = 0;
        let reembolso = 0;
        for (let i = 0; i < facturas.length; i++) {
            totalFacturado += parseFloat(facturas[i][7]);
            reembolso += parseFloat(facturas[i][25]);
            noAplica += parseFloat(facturas[i][26]);
            if (facturas[i][27] !== null && facturas[i][27] !== "") {
                setRejected(true);
            }
        }
        setTotalFacturado(totalFacturado);
        setNoAplica(noAplica);
        setReembolso(reembolso);
        // return ret;
    }

    useEffect(() => {
        if (typeof props.match.params.id !== "undefined") {
            setDisablePresupuesto(true);
            setId(props.match.params.id);
            setLoading(true);
            axios({
                method: 'get',
                url: props.url + 'liquidacion/' + props.match.params.id,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    setFacturas(resp.data.facturas);
                    setCuadrar(resp.data.cuadrar);

                    setRechazoSupervisor(resp.data.rechazo_supervisor);
                    setRechazoConta(resp.data.rechazo_contabilidad);
                    setResultados_subida_sap(resp.data.resultados_subida_sap);

                    sumTotales(resp.data.facturas);

                    const fi = format(parseISO(resp.data.fecha_inicio.split('T')[0]), 'MM/dd/yyyy');
                    setFechaInicio(fi);

                    const ff = format(parseISO(resp.data.fecha_fin.split('T')[0]), 'MM/dd/yyyy');
                    setFechaFin(ff);

                    setPresupuesto(
                        {
                            "value": resp.data.au_gasto_id,
                            "label": resp.data.au_gasto_label
                        }
                    );

                    setEstado(resp.data.au_estado_liquidacion_id);
                    setNombreUsuario(resp.data.nombre);
                    setUID(resp.data.uid);
                    // Get the empresa to get the currency
                    axios({
                        method: 'get',
                        url: props.url + 'empresa-by-presupuesto/' + resp.data.au_gasto_id,
                        responseType: "json",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(function (resp) {
                            setEmpresa(resp.data);
                            props.loadProveedoresApp(resp.data[0].id);
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                    // Get the Gastos
                    axios({
                        method: 'get',
                        url: props.url + 'liquidacion-gastos/' + Cookies.get('lu_id') + '/' + resp.data.au_gasto_id,
                        responseType: "json",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(function (resp) {
                            setGastos(resp.data);
                        })
                        .catch(function (err) {
                            console.log(err);
                        });

                    setComentarios(resp.data.comentario);
                    setLoading(false);
                })
                .catch(function (err) {
                    console.log(err);
                    setLoading(false);
                    if (err.response)
                        swal("Error", err.response.data.msg, "error");
                });
        }
    }, [refresh]);

    const enviarAprobacionContabilidad = () => {
        setLoading(true);
        axios({
            method: 'post',
            url: props.url + 'liquidacion-enviar-aprobacion-contador/' + id,
            responseType: "json",
            headers: { "Content-Type": "application/json" }
        })
            .then(function (resp) {
                swal("Éxito", "¡Liquidación enviada para aprobación!", "success");
                props.loadLiquidaciones();
                props.history.push(`/liquidaciones`);
                setLoading(false);
            })
            .catch(function (err) {
                console.log(err);
                setLoading(false);
            });
    }

    const enviarRechazoSupervisor = () => {
        swal({
            text: 'Ingrese la razón del rechazo.',
            content: "input",
            button: {
                text: "Rechazar"
            },
        })
            .then(razon => {
                if (razon) {
                    let data = {
                        'razon': razon,
                        'id': id
                    }
                    setLoading(true);
                    axios({
                        method: 'post',
                        url: props.url + 'liquidacion-enviar-rechazo-supervisor/',
                        data,
                        responseType: "json",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(function (resp) {
                            swal("Éxito", "¡Se ha rechazado la liquidación!", "success");
                            props.loadLiquidaciones();
                            props.history.push(`/liquidaciones`);
                            setLoading(false);
                        })
                        .catch(function (err) {
                            console.log(err);
                            setLoading(false);
                        });
                } else {
                    swal("¡Atención!", "Debes de ingresar la razón del rechazo.", "error");
                }
            });
    }

    const subirSap = () => {
        setLoading(true);
        axios({
            method: 'post',
            url: props.url + 'liquidacion-subir-sap/' + id,
            responseType: "json",
            headers: { "Content-Type": "application/json" }
        })
            .then(function (resp) {
                if (resp.data === true) {
                    swal("Éxito", "¡Se ha subido la liquidación a SAP!", "success");
                    props.loadLiquidaciones();
                    props.history.push(`/liquidaciones`);
                } else {
                    swal("Error", "¡Hay un error al subir a SAP!", "warning")
                        .then(x => {
                            setRefresh(refresh + 1);
                        });
                }
                setLoading(false);
            })
            .catch(function (err) {
                console.log(err);
                setLoading(false);
            });
    }

    const enviarRechazoContabilidad = () => {
        swal({
            text: 'Ingrese la razón del rechazo.',
            content: "input",
            button: {
                text: "Rechazar"
            },
        })
            .then(razon => {
                if (razon) {
                    let data = {
                        'razon': razon,
                        'id': id
                    }
                    setLoading(true);
                    axios({
                        method: 'post',
                        url: props.url + 'liquidacion-enviar-rechazo-contabilidad/',
                        data,
                        responseType: "json",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(function (resp) {
                            swal("Éxito", "¡Se ha rechazado la liquidación!", "success");
                            props.loadLiquidaciones();
                            props.history.push(`/liquidaciones`);
                            setLoading(false);
                        })
                        .catch(function (err) {
                            console.log(err);
                            setLoading(false);
                        });
                } else {
                    swal("¡Atención!", "Debes de ingresar la razón del rechazo.", "error");
                }
            });
    }
    const enviarAprobacion = () => {
        if (id !== -1) {
            setLoading(true);
            axios({
                method: 'post',
                url: props.url + 'liquidacion-enviar-aprobacion-supervisor/' + id,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    swal("Éxito", "¡Liquidación enviada para aprobación!", "success");
                    props.loadLiquidaciones();
                    props.history.push(`/liquidaciones`);
                    setLoading(false);
                })
                .catch(function (err) {
                    console.log(err);
                    setLoading(false);
                });
        } else {
            swal("Error", "¡Debes de guardar primero la liquidación!", "error");
        }
    }

    const nuevaFactura = () => {
        setGasto2(null);
        setComentarios2("");
    }

    const editFactura = (idx) => {
        setEdit(idx);
        let t = facturas[idx];
        for (let i = 0; i < gastos.length; i++) {
            if (parseInt(gastos[i].value) === parseInt(t[0])) {
                setGasto2(gastos[i]);
                setIgnorarXML(gastos[i].ignorar_xml);
                setLoading(true);
                axios({
                    method: 'get',
                    url: props.url + 'sub-gastos/' + gastos[i].value,
                    responseType: "json",
                    headers: { "Content-Type": "application/json" }
                })
                    .then(function (resp) {
                        setSubGastos(resp.data);
                        setLoading(false);
                    })
                    .catch(function (err) {
                        console.log(err);
                        setLoading(false);
                    });
                break;
            }
        }
        setLoading(true);
        axios({
            method: 'get',
            url: props.url + 'sub-gastos/' + parseInt(t[0]),
            responseType: "json",
            headers: { "Content-Type": "application/json" }
        })
            .then(function (resp) {
                setSubGastos(resp.data);

                for (let i = 0; i < resp.data.length; i++) {
                    if (parseInt(resp.data[i].value) === parseInt(t[2])) {
                        setSubgasto(resp.data[i]);
                        break;
                    }
                }
                setLoading(false);
            })
            .catch(function (err) {
                console.log(err);
                setLoading(false);
            });

        setProveedor({ value: parseInt(t[4]), label: t[5] });
        let f = t[6].split("/");
        if (f.length === 1) {
            f = t[6].split("-");
        }
        setFecha(f[2] + "-" + f[1] + "-" + f[0]);
        setTotal(t[7]);
        setMoneda(t[8]);
        setSerie(t[9]);
        setNumero(t[10]);
        setUUID(t[11]);
        setFormaPago(t[12]);
        setMetodoPago(t[13]);
        setCfdi(t[14]);
        setInicial(t[15]);
        setFinal(t[16]);
        setCantidad(t[17]);
        setFacturaContent(t[18]);

        // Set Factura url
        fetch(t[18])
            .then(res => res.blob())
            .then(
                (res) => setFacturaURL(URL.createObjectURL(res))
            );

        setXMLContent(t[19]);
        // Set XML URL
        let blob = new Blob([t[19]], { type: 'text/xml' });
        let url = URL.createObjectURL(blob);
        setXMLURL(url);
        setComentarios2(t[21]);
        if (t[27] !== false)
            setRazon(t[27]);
    }

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
                        let temp = [...facturas];
                        let id_factura = temp[idx][22];
                        setLoading(true);
                        axios({
                            method: 'post',
                            url: props.url + 'liquidacion-delete-factura/' + id_factura,
                            responseType: "json",
                            headers: { "Content-Type": "application/json" }
                        })
                            .then(function (resp) {
                                setRefresh(refresh + 1);
                                // // Reset form
                                setGasto2(null);
                                setComentarios2("");
                                setLoading(false);
                            })
                            .catch(function (err) {
                                console.log(err);
                                swal("Error", err.response.data.msg, "error");
                                setLoading(false);
                            });
                    }
                });
        }
    }

    const reject = (id) => {
        swal({
            text: 'Ingrese la razón del rechazo',
            content: "input",
            buttons: ["Cancelar", "Rechazar"],
        })
            .then(razon => {
                if (razon !== null) {
                    axios({
                        method: 'post',
                        url: props.url + 'rechazo-factura/' + id,
                        data: {
                            razon: razon
                        },
                        responseType: "json",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(function (resp) {
                            setRefresh(refresh + 1);
                        })
                        .catch(function (err) {
                            swal("Error", err.response.data.msg, "error");
                        });
                }
                console.log(id, razon);
            })

    }

    const verRechazo = (razon) => {
        swal("Rechazo por", razon, "warning");
    }

    return (
        <div className="main-container">
            <Modal
                open={openCuadrar}
                onClose={() => setOpenCuadrar(!openCuadrar)}
            >
                <div style={modalStyle} className={classes.paper}>
                    <div className="table-container">
                        <Typography variant="h4" component="h6" gutterBottom>
                            Presupuesto vs Real
                        </Typography>
                        {
                            loading ?
                                (
                                    <img src="./images/loading.gif" alt="" />
                                ) :
                                (
                                    <table className="detail-table">
                                        <thead>
                                            <tr>
                                                <th>Gasto</th>
                                                <th>Tipo</th>
                                                <th>Frecuencia</th>
                                                <th>Presupuesto</th>
                                                <th>Ejecutado</th>
                                                <th>Disponible</th>
                                            </tr>
                                        </thead>
                                        {
                                            cuadrar && cuadrar.length > 0
                                                ?
                                                (
                                                    <tbody>
                                                        {
                                                            cuadrar.map((key, idx) => {
                                                                let total = key.tipo_asignacion === "dinero" ?
                                                                    key.total_real
                                                                    : key.cantidad_real;
                                                                if (total === null || total === '') total = 0;
                                                                return (
                                                                    <tr key={idx}>
                                                                        <td>
                                                                            {key.categoria_gasto_nombre}
                                                                        </td>
                                                                        <td>
                                                                            {key.tipo_asignacion}
                                                                        </td>
                                                                        <td>
                                                                            {key.frecuencia_nombre}
                                                                        </td>
                                                                        <td>
                                                                            {key.asignacion_cantidad.toLocaleString('en-US', {
                                                                                minimumFractionDigits: 2,
                                                                                maximumFractionDigits: 2
                                                                            })}
                                                                            {
                                                                                key.asignacion_medida !== '' ? ` ${key.asignacion_medida}` : ''
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                total.toLocaleString('en-US', {
                                                                                    minimumFractionDigits: 2,
                                                                                    maximumFractionDigits: 2
                                                                                })
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                (key.asignacion_cantidad - total).toLocaleString('en-US', {
                                                                                    minimumFractionDigits: 2,
                                                                                    maximumFractionDigits: 2
                                                                                })
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                    </tbody>
                                                )
                                                :
                                                (
                                                    <tbody></tbody>
                                                )
                                        }
                                    </table>
                                )
                        }
                        <Button
                            color="secondary"
                            variant="contained"
                            className="close-button-modal"
                            onClick={() => setOpenCuadrar(false)}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </Modal>
            <Typography variant="h3" component="h1" gutterBottom>
                <Link className="link" to="/liquidaciones">
                    <ArrowBackIosIcon />
                </Link>
                {
                    typeof props.match.params.id !== "undefined" ? "Editar liquidación " : "Crear liquidación"
                }
                <Button
                    color="primary"
                    variant="contained"
                    className="close-button-modal"
                    onClick={() => setOpenCuadrar(true)}
                >
                    Ver presupuesto
                </Button>
            </Typography>
            <div className="empresa-container">
                <form onSubmit={formik.handleSubmit}>
                    <div className="full">
                        <h2>
                            {
                                estado === "0" || estado === "2" || estado === "4"
                                    ? `Datos Liquidación (${id}) usuario: `
                                    : estado === "1" ?
                                        `Aprobacion (Supervisor) Liquidación (${id}) usuario: `
                                        : estado === "3" ?
                                            `Aprobacion (Contabilidad) Liquidación (${id}) usuario: `
                                            : ""
                            }
                            {nombreUsuario}
                        </h2>
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
                                            disabled={!(estado === "0" || estado === "2" || estado === "4" || id === -1)}
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
                                            disabled={!(estado === "0" || estado === "2" || estado === "4" || id === -1)}
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
                                        disabled={!(parseInt(estado) === 0 || parseInt(estado) === 2 || parseInt(estado) === 4)}
                                    />
                                </FormControl>
                            </Grid>
                            {
                                rechazoSupervisor !== '' && rechazoSupervisor !== null ?
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
                                                    error
                                                />
                                            </FormControl>
                                        </Grid>
                                    ) : ""
                            }

                            {
                                rechazoConta !== '' && rechazoConta !== null ?
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
                                                    error
                                                />
                                            </FormControl>
                                        </Grid>
                                    ) : ""
                            }
                            {
                                resultados_subida_sap !== '' && resultados_subida_sap !== null ?
                                    (
                                        <Grid item xs={4}>
                                            <div
                                                dangerouslySetInnerHTML={{ __html: resultados_subida_sap }}
                                            />
                                        </Grid>
                                    ) : ""
                            }

                        </Grid>
                    </div>
                </form>

                {
                    estado === "0" || estado === "2" || estado === "4" || id === -1 ?
                        (
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Button
                                        color="secondary"
                                        variant="contained"
                                        className="full-button"
                                        fullWidth
                                        type="text"
                                        disable={loading}
                                        onClick={() => formik.submitForm()}
                                    >
                                        Guardar
                                    </Button>
                                    {
                                        loading ?
                                            (
                                                <LinearProgress color="secondary" />
                                            ) : ""
                                    }
                                </Grid>
                                {
                                    id !== -1 ?
                                        (
                                            <Grid item xs={6}>
                                                <Button
                                                    color="primary"
                                                    variant="contained"
                                                    className="full-button"
                                                    fullWidth
                                                    type="text"
                                                    onClick={enviarAprobacion}
                                                    disabled={loading}
                                                >
                                                    Enviar a Aprobación
                                                </Button>
                                                {
                                                    loading ?
                                                        (
                                                            <LinearProgress color="secondary" />
                                                        ) : ""
                                                }
                                            </Grid>

                                        ) : ""
                                }
                            </Grid>
                        ) : ""
                }
                {
                    estado === "1" ?
                        (
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        className="full-button"
                                        fullWidth
                                        type="text"
                                        onClick={enviarAprobacionContabilidad}
                                        disable={loading}
                                    >
                                        Aprobar
                                    </Button>
                                    {
                                        loading ?
                                            (
                                                <LinearProgress color="secondary" />
                                            ) : ""
                                    }
                                </Grid>

                                {
                                    // Si hay facturas rechazadas
                                    rejected ?
                                        (
                                            <Grid item xs={6}>
                                                <Button
                                                    color="secondary"
                                                    variant="contained"
                                                    className="full-button"
                                                    fullWidth
                                                    type="text"
                                                    onClick={enviarRechazoSupervisor}
                                                    disable={loading}
                                                >
                                                    Rechazar
                                                </Button>
                                                {
                                                    loading ?
                                                        (
                                                            <LinearProgress color="secondary" />
                                                        ) : ""
                                                }
                                            </Grid>
                                        ) : ""
                                }
                            </Grid>
                        ) : ""
                }
                {
                    estado === "3" ?
                        (
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        className="full-button"
                                        fullWidth
                                        type="text"
                                        onClick={subirSap}
                                        disabled={loading}
                                    >
                                        Aprobar y Subir a SAP
                                    </Button>
                                    {
                                        loading ?
                                            (
                                                <LinearProgress color="secondary" />
                                            ) : ""
                                    }
                                </Grid>

                                {
                                    // Si hay facturas rechazadas
                                    rejected ?
                                        (
                                            <Grid item xs={6}>
                                                <Button
                                                    color="secondary"
                                                    variant="contained"
                                                    className="full-button"
                                                    fullWidth
                                                    type="text"
                                                    onClick={enviarRechazoContabilidad}
                                                    disabled={loading}
                                                >
                                                    Rechazar
                                                </Button>
                                                {
                                                    loading ?
                                                        (
                                                            <LinearProgress color="secondary" />
                                                        ) : ""
                                                }
                                            </Grid>
                                        ) : ""
                                }
                            </Grid>
                        ) : ""
                }

            </div>
            {
                id !== -1 ?
                    (
                        <div className="empresa-container">
                            <div className="full">
                                <Typography variant="h4" component="h6" gutterBottom>
                                    Facturas
                                    {
                                        gasto2 !== null ?
                                            (
                                                <Button
                                                    color="primary"
                                                    className="full-button"
                                                    onClick={nuevaFactura}
                                                    style={{ float: "right" }}
                                                >
                                                    Nueva Factura
                                                </Button>
                                            ) : ""
                                    }

                                </Typography>
                                <div className="table-container">
                                    {
                                        loading ?
                                            (
                                                <img src="./images/loading.gif" alt="" />
                                            ) :
                                            (
                                                <table className="detail-table">
                                                    <thead>
                                                        <tr>
                                                            <th>ID</th>
                                                            <th>Número</th>
                                                            <th>Gasto</th>
                                                            <th>Proveedor</th>
                                                            <th>Fecha</th>
                                                            <th>Moneda</th>
                                                            <th>Total</th>
                                                            <th>Cantidad</th>
                                                            <th>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    {
                                                        facturas && facturas.length > 0
                                                            ?
                                                            (
                                                                <tbody>
                                                                    {
                                                                        facturas.map((key, idx) => {
                                                                            let fe = key[6].split("-");
                                                                            fe = fe[0] + "/" + fe[1] + "/" + fe[2];

                                                                            let blobXML = new Blob([key[19]], { type: 'text/xml' });
                                                                            let urlXML = ''
                                                                            if (key[19] !== "") {
                                                                                urlXML = URL.createObjectURL(blobXML);
                                                                            }
                                                                            return (
                                                                                <tr key={idx}>
                                                                                    <td>
                                                                                        {key[22]}
                                                                                    </td>
                                                                                    <td>
                                                                                        <a href={URL.createObjectURL(makeblob(key[18]))} target="_blank" rel="noreferrer">
                                                                                            {
                                                                                                key[9] !== "" ? key[9] + " - " : ""
                                                                                            }
                                                                                            {key[10]}
                                                                                        </a>
                                                                                    </td>
                                                                                    <td>
                                                                                        {key[1]}
                                                                                        {
                                                                                            key[3] !== '' ? ` - ${key[3]}` : ''
                                                                                        }
                                                                                    </td>
                                                                                    <td>
                                                                                        {key[5]}
                                                                                    </td>
                                                                                    <td>
                                                                                        {fe}
                                                                                    </td>
                                                                                    <td>
                                                                                        {key[8]}
                                                                                    </td>
                                                                                    <td>
                                                                                        {
                                                                                            key[7].toLocaleString('en-US', {
                                                                                                minimumFractionDigits: 2,
                                                                                                maximumFractionDigits: 2
                                                                                            })
                                                                                        }
                                                                                    </td>
                                                                                    <td>
                                                                                        {
                                                                                            key[17]
                                                                                        }
                                                                                    </td>
                                                                                    <td>
                                                                                        {
                                                                                            key[27] !== null && key[27] !== "" ?
                                                                                                (
                                                                                                    <span
                                                                                                        className='view-link ver-rechazo'
                                                                                                        onClick={() => verRechazo(key[27])}
                                                                                                    >
                                                                                                        Ver Razón del rechazo
                                                                                                    </span>
                                                                                                ) : ""
                                                                                        }
                                                                                        <a
                                                                                            href={URL.createObjectURL(makeblob(key[18]))}
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                                            className='view-link'
                                                                                        >
                                                                                            Ver Factura
                                                                                        </a>
                                                                                        {
                                                                                            estado === "0" ||
                                                                                                (estado === "2" && key[27] !== null && key[27] !== "") ||
                                                                                                (estado === "4" && key[27] !== null && key[27] !== "") ?
                                                                                                (
                                                                                                    <React.Fragment>
                                                                                                        <Button
                                                                                                            color="primary"
                                                                                                            variant="contained"
                                                                                                            type="button"
                                                                                                            onClick={() => editFactura(idx)}
                                                                                                            style={{ marginRight: "10px" }}
                                                                                                        >
                                                                                                            <Edit />
                                                                                                        </Button>
                                                                                                        <Button
                                                                                                            color="secondary"
                                                                                                            variant="contained"
                                                                                                            type="button"
                                                                                                            onClick={() => removeFactura(idx)}
                                                                                                        >
                                                                                                            <Delete />
                                                                                                        </Button>
                                                                                                    </React.Fragment>
                                                                                                ) :
                                                                                                estado !== "0" && estado !== "2" && estado !== "4" ?
                                                                                                    (
                                                                                                        <React.Fragment>
                                                                                                            {
                                                                                                                urlXML !== '' ?
                                                                                                                    (
                                                                                                                        <a
                                                                                                                            href={urlXML}
                                                                                                                            target="_blank"
                                                                                                                            rel="noreferrer"
                                                                                                                            className='view-link'
                                                                                                                        >
                                                                                                                            Ver XML
                                                                                                                        </a>
                                                                                                                    ) : ""
                                                                                                            }

                                                                                                            {
                                                                                                                key[27] !== null && key[27] !== "" ?
                                                                                                                    "" :
                                                                                                                    (
                                                                                                                        <span
                                                                                                                            className='view-link rechazar'
                                                                                                                            onClick={() => reject(key[22])}
                                                                                                                        >
                                                                                                                            Rechazar
                                                                                                                        </span>
                                                                                                                    )
                                                                                                            }
                                                                                                        </React.Fragment>
                                                                                                    ) : ""
                                                                                        }

                                                                                    </td>
                                                                                </tr>
                                                                            )
                                                                        })
                                                                    }
                                                                </tbody>
                                                            )
                                                            :
                                                            (
                                                                <tbody></tbody>
                                                            )
                                                    }
                                                </table>
                                            )
                                    }
                                </div>

                                <br />
                                <br />
                                <br />
                                <hr />
                                <br />
                                <Typography variant="h4" component="h6" gutterBottom>
                                    Factura
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={4}>
                                        <FormControl variant="outlined" className="form-item">
                                            <label htmlFor="gasto" className="manual">
                                                Seleccione el gasto
                                            </label>
                                            <Select2
                                                isSearchable={true}
                                                onChange={handleChangeSelect}
                                                value={gasto2}
                                                name="gasto2"
                                                id="gasto2"
                                                options={gastos}
                                                placeholder="* Gasto"
                                                isDisabled={!(estado === "0" || estado === "2" || estado === "4") || rejected}
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
                                                                            isDisabled={!(estado === "0" || estado === "2" || estado === "4")}
                                                                        />
                                                                    </FormControl>
                                                                ) : ""
                                                        }
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <FormControl variant="outlined" className="form-item">
                                                            <label htmlFor="proveedor" className="manual">
                                                                Seleccione proveedor
                                                                {
                                                                    (empresa && empresa[0].maneja_xml !== 1) || ignorarXML === 1 ?
                                                                        (
                                                                            <span
                                                                                onClick={() => setOpen(true)}
                                                                                style={
                                                                                    {
                                                                                        "float": "right",
                                                                                        "color": "#3f51b5",
                                                                                        "cursor": "pointer"
                                                                                    }
                                                                                }
                                                                            >
                                                                                Nuevo
                                                                            </span>
                                                                        ) : ""
                                                                }
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
                                                        subgasto !== null && subgasto.exento === 1 && (subgasto.tipo === 'cantidad' || subgasto.tipo === '') ?
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
                                                                    // disabled={empresa && empresa[0].maneja_xml === 1 && ignorarXML !== 1}
                                                                    disabled={true}
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
                                                                value={comentarios2}
                                                                onChange={handleChange}
                                                                type="text"
                                                                multiline
                                                                disabled={!(estado === "0" || estado === "2" || estado === "4")}
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
                                                                disabled={!(estado === "0" || estado === "2" || estado === "4")}
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
                                                                            disabled={!(estado === "0" || estado === "2" || estado === "4")}
                                                                        />
                                                                    </Button>
                                                                ) : ""
                                                        }
                                                        {
                                                            xmlContent !== '' ?
                                                                (
                                                                    <a className="file-link" href={xmlURL} target="_blank" rel="noreferrer">Ver XML</a>
                                                                ) : ""
                                                        }
                                                    </Grid>
                                                    {
                                                        estado === "0" || estado === "2" || estado === "4" ?
                                                            (
                                                                <Grid item xs={12}>
                                                                    <Button
                                                                        color="secondary"
                                                                        variant="contained"
                                                                        className="full-button"
                                                                        fullWidth
                                                                        type="text"
                                                                        onClick={agregarFactura}
                                                                        disabled={loading}
                                                                    >
                                                                        Guardar Factura
                                                                    </Button>
                                                                    {
                                                                        loading ?
                                                                            (
                                                                                <LinearProgress color="secondary" />
                                                                            ) : ""
                                                                    }
                                                                </Grid>
                                                            ) : ""
                                                    }
                                                </React.Fragment>
                                            ) : ""
                                    }

                                </Grid>

                            </div>
                        </div>
                    ) :
                    ""
            }

            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    Agregar proveedor
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="nombre"
                        name="nombreAdd"
                        value={nombreAdd}
                        label="Nombre"
                        type="text"
                        fullWidth
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        id="nit"
                        name="nitAdd"
                        value={nitAdd}
                        label="Identificación Fiscal"
                        type="text"
                        fullWidth
                        onChange={handleChange}
                    />
                    <FormControl component="fieldset" style={{ marginTop: "15px" }}>
                        <FormLabel component="legend">* Tipo Proveedor</FormLabel>
                        <RadioGroup
                            aria-label="tipo_proveedor"
                            name="tipo_proveedor"
                            value={tipo_proveedor}
                            onChange={handleChange}
                        >
                            <FormControlLabel
                                value="PC"
                                control={<Radio />}
                                label="Pequeño Contribuyente"
                            />
                            <FormControlLabel
                                value="PJ"
                                control={<Radio />}
                                label="Persona Jurídica"
                            />
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleAgregar} color="primary">
                        Agregar
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    );
};
export default LiquidacionEdit;
