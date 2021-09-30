import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import { useFormik } from 'formik';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core/styles';
import swal from 'sweetalert';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Select2 from 'react-select';

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

const dbTypes = [
    {
        value: 'dst_MSSQL',
        label: 'dst_MSSQL'
    },
    {
        value: 'dst_DB_2',
        label: 'dst_DB_2'
    },
    {
        value: 'dst_SYBASE',
        label: 'dst_SYBASE'
    },
    {
        value: 'dst_MSSQL2005',
        label: 'dst_MSSQL2005'
    },
    {
        value: 'dst_MAXDB',
        label: 'dst_MAXDB'
    },
    {
        value: 'dst_MSSQL2008',
        label: 'dst_MSSQL2008'
    },
    {
        value: 'dst_MSSQL2012',
        label: 'dst_MSSQL2012'
    },
    {
        value: 'dst_MSSQL2014',
        label: 'dst_MSSQL2014'
    },
    {
        value: 'dst_HANADB',
        label: 'dst_HANADB'
    },
    {
        value: 'MSSQL2014',
        label: 'MSSQL2014'
    },
]

const EmpresaEdit = (props) => {
    const [id, setId] = useState(-1);
    const [remanente_nota_credito, setremanente_nota_credito] = useState(false);
    const [maneja_xml, setmaneja_xml] = useState(false);
    const [ajuste_fin_mes, setajuste_fin_mes] = useState(false);
    const [control_numero_factura, setcontrol_numero_factura] = useState(false);
    const [bancos, setBancos] = useState("");

    const [usuario_sql, set_usuario_sql] = useState("");
    const [base_sql, set_base_sql] = useState("");
    const [contrasena_sql, set_contrasena_sql] = useState("");
    const [servidor_sql, set_servidor_sql] = useState("");
    const [empresa, setEmpresa] = useState({
        CompnyName: "",
        MainCurncy: "",
        SysCurrncy: "",
        TaxIdNum: ""
    });
    const [impuestos, setImpuestos] = useState([]);
    const [valor_impuesto, setValorImpuesto] = useState(null);
    const [sap_db_type, setDBType] = useState(null);

    const handleChangeSelect = (option, b) => {
        if (b.name === "valor_impuesto") {
            setValorImpuesto(option);
        }
        if (b.name === "sap_db_type") {
            setDBType(option);
        }
    }

    const handleChange = (e) => {
        let v = e.target.value;
        let n = e.target.name;
        if (n === "usuario_sql") {
            set_usuario_sql(v);
        }
        if (n === "base_sql") {
            set_base_sql(v);
        }
        if (n === "contrasena_sql") {
            set_contrasena_sql(v);
        }
        if (n === "servidor_sql") {
            set_servidor_sql(v);
        }
        if (n === "bancos") {
            setBancos(v);
        }
    };

    const validateSQL = () => {
        if (usuario_sql !== "" && base_sql !== "" && contrasena_sql !== "" && servidor_sql !== "") {
            let data = {
                usuario_sql,
                base_sql,
                contrasena_sql,
                servidor_sql,
            };
            axios({
                method: 'post',
                url: props.url + 'validate-empresa-sql',
                data: JSON.stringify(data),
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    let d = resp.data;
                    if (d.valid) {
                        setEmpresa(d.info[0]);
                        setImpuestos(d.impuestos);
                        setBancos(JSON.stringify(d.bancos));
                    } else {
                        swal("Error", "¡Data SQL no válida!", "error");
                    }
                })
                .catch(function (err) {
                    console.log(err);
                    swal("Error", err.response.data.msg, "error");
                });
        } else {
            swal("Atención", "¡Por favor ingrese toda la información!", "warning");
        }
    }

    const classes = useStyles();
    // Pass the useFormik() hook initial form values and a submit function that will
    // be called when the form is submitted
    const formik = useFormik({
        initialValues: {
            servidor_licencias: '',
            bd_sap: '',
            usuario_sap: '',
            contrasena_sap: '',
            segundos_espera: '',
            ruta_archivos: '',
            usuario_sql: '',
            dias_atraso_facturacion_ruta: '',
            dias_atraso_facturacion_gastos: '',
            dia_efectivo_ajuste: ''
        },
        onSubmit: values => {
            values.user_id = id;
            values.remanente_nota_credito = remanente_nota_credito ? 1 : 0;
            values.maneja_xml = maneja_xml ? 1 : 0;
            values.ajuste_fin_mes = ajuste_fin_mes ? 1 : 0;
            values.control_numero_factura = control_numero_factura ? 1 : 0;

            values.nombre = empresa.CompnyName;
            values.moneda_local = empresa.MainCurncy;
            values.moneda_extranjera = empresa.SysCurrncy;
            values.no_identificacion_fiscal = empresa.TaxIdNum;

            values.usuario_sql = usuario_sql;
            values.base_sql = base_sql;
            values.contrasena_sql = contrasena_sql;
            values.servidor_sql = servidor_sql;

            values.valor_impuesto = valor_impuesto ? valor_impuesto.value : 0;
            values.label_impuesto = valor_impuesto ? valor_impuesto.label : 0;

            values.sap_db_type = sap_db_type ? sap_db_type.value : 0;
            values.sap_db_type_label = sap_db_type ? sap_db_type.label : 0;

            values.bancos = bancos;

            let data = JSON.stringify(values);

            if (id === -1) {
                axios({
                    method: 'post',
                    url: props.url + 'empresa',
                    data,
                    responseType: "json",
                    headers: { "Content-Type": "application/json" }
                })
                    .then(function (resp) {
                        swal("Éxito", resp.data.msg, "success");
                        props.loadEmpresas();
                        props.history.push(`/empresas`);
                    })
                    .catch(function (err) {
                        swal("Error", err.response.data, "error");
                    });
            } else {
                axios({
                    method: 'put',
                    url: props.url + 'empresa/' + id,
                    data,
                    responseType: "json",
                    headers: { "Content-Type": "application/json" }
                })
                    .then(function (resp) {
                        swal("Éxito", resp.data.msg, "success");
                        props.loadEmpresas();
                        props.history.push(`/empresas`);
                    })
                    .catch(function (err) {
                        swal("Error", err.response.data, "error");
                    });
            }

        },
    });

    useEffect(() => {
        if (typeof props.match.params.id !== "undefined") {
            setId(props.match.params.id);
            axios({
                method: 'get',
                url: props.url + 'empresa/' + props.match.params.id,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    formik.setFieldValue('servidor_licencias', resp.data.servidor_licencias, false);
                    formik.setFieldValue('usuario_sap', resp.data.usuario_sap, false);
                    formik.setFieldValue('contrasena_sap', resp.data.contrasena_sap, false);
                    formik.setFieldValue('codigo_empresa', resp.data.codigo_empresa, false);
                    formik.setFieldValue('moneda_local', resp.data.moneda_local, false);
                    formik.setFieldValue('moneda_extranjera', resp.data.moneda_extranjera, false);
                    formik.setFieldValue('dias_atraso_facturacion_ruta', resp.data.dias_atraso_facturacion_ruta, false);
                    formik.setFieldValue('dias_atraso_facturacion_gastos', resp.data.dias_atraso_facturacion_gastos, false);
                    formik.setFieldValue('dia_efectivo_ajuste', resp.data.dia_efectivo_ajuste, false);

                    setremanente_nota_credito(resp.data.remanente_nota_credito === 1);
                    setmaneja_xml(resp.data.maneja_xml === 1);
                    setajuste_fin_mes(resp.data.ajuste_fin_mes === 1);
                    setcontrol_numero_factura(resp.data.control_numero_factura === 1);

                    setValorImpuesto(
                        {
                            "value": resp.data.valor_impuesto,
                            "label": resp.data.label_impuesto
                        }
                    );

                    setDBType({
                        "value": resp.data.sap_db_type,
                        "label": resp.data.sap_db_type_label
                    });

                    setEmpresa({
                        CompnyName: resp.data.nombre,
                        MainCurncy: resp.data.moneda_local,
                        SysCurrncy: resp.data.moneda_extranjera,
                        TaxIdNum: resp.data.no_identificacion_fiscal
                    });
                    set_usuario_sql(resp.data.usuario_sql);
                    set_base_sql(resp.data.base_sql);
                    set_contrasena_sql(resp.data.contrasena_sql);
                    set_servidor_sql(resp.data.servidor_sql);

                    setBancos(resp.data.bancos);
                })
                .catch(function (err) {
                    console.log(err);
                    if (err.response)
                        swal("Error", err.response.data.msg, "error");
                });
        }
    }, [])


    return (
        <div className="main-container">
            <Typography variant="h3" component="h1" gutterBottom>
                <Link className="link" to="/empresas">
                    <ArrowBackIosIcon />
                </Link>
                {
                    typeof props.match.params.id !== "undefined" ? "Editar empresa" : "Crear empresa"
                }
            </Typography>
            <div className="empresa-container">
                <div className="full">
                    <div className="section">
                        <h2>SQL</h2>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="usuario_sql"
                                name="usuario_sql"
                                label="Usuario SQL"
                                type="text"
                                value={usuario_sql}
                                onChange={handleChange}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="base_sql"
                                name="base_sql"
                                label="Nombre BD"
                                type="text"
                                value={base_sql}
                                onChange={handleChange}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="contrasena_sql"
                                name="contrasena_sql"
                                label="Contraseña SQL"
                                type="text"
                                value={contrasena_sql}
                                onChange={handleChange}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="servidor_sql"
                                name="servidor_sql"
                                label="Servidor SQL"
                                type="text"
                                value={servidor_sql}
                                onChange={handleChange}
                            />
                        </FormControl>
                        <Button
                            color="primary"
                            variant="contained"
                            size="large"
                            onClick={validateSQL}
                        >
                            Validar Datos
                        </Button>
                    </div>
                </div>
                <form onSubmit={formik.handleSubmit}>
                    <div className="left">
                        <h2>Datos Empresa</h2>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="nombre"
                                name="nombre"
                                label="Nombre"
                                value={empresa.CompnyName}
                                InputProps={{
                                    disabled: true,
                                }}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="moneda_local"
                                name="moneda_local"
                                label="Moneda Local"
                                type="text"
                                value={empresa.MainCurncy}
                                InputProps={{
                                    disabled: true,
                                }}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="moneda_extranjera"
                                name="moneda_extranjera"
                                label="Moneda Extranjera"
                                type="text"
                                value={empresa.SysCurrncy}
                                InputProps={{
                                    disabled: true,
                                }}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="no_identificacion_fiscal"
                                name="no_identificacion_fiscal"
                                label="Número de identificación fiscal"
                                type="text"
                                value={empresa.TaxIdNum}
                                InputProps={{
                                    disabled: true,
                                }}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl} variant="outlined">
                            <Select2
                                isSearchable={true}
                                isClearable={true}
                                onChange={handleChangeSelect}
                                value={valor_impuesto}
                                name="valor_impuesto"
                                id="valor_impuesto"
                                options={impuestos}
                                placeholder="*Selecciones valor de Impuesto"
                            />
                        </FormControl>


                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="dias_atraso_facturacion_ruta"
                                name="dias_atraso_facturacion_ruta"
                                label="Dias de atraso facturación ruta"
                                type="number"
                                value={formik.values.dias_atraso_facturacion_ruta}
                                onChange={formik.handleChange}
                                error={formik.touched.dias_atraso_facturacion_ruta && Boolean(formik.errors.dias_atraso_facturacion_ruta)}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="dias_atraso_facturacion_gastos"
                                name="dias_atraso_facturacion_gastos"
                                label="Dias de atraso facturación gastos"
                                type="number"
                                value={formik.values.dias_atraso_facturacion_gastos}
                                onChange={formik.handleChange}
                                error={formik.touched.dias_atraso_facturacion_gastos && Boolean(formik.errors.dias_atraso_facturacion_gastos)}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="dia_efectivo_ajuste"
                                name="dia_efectivo_ajuste"
                                label="Día efectivo del ajuste"
                                type="text"
                                value={formik.values.dia_efectivo_ajuste}
                                onChange={formik.handleChange}
                                error={formik.touched.dia_efectivo_ajuste && Boolean(formik.errors.dia_efectivo_ajuste)}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={remanente_nota_credito}
                                        color="primary"
                                        onChange={() => setremanente_nota_credito(!remanente_nota_credito)}
                                        name="remanente_nota_credito"
                                        id="remanente_nota_credito"
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />
                                }
                                label="Remanente nota de crédito"
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={maneja_xml}
                                        color="primary"
                                        onChange={() => setmaneja_xml(!maneja_xml)}
                                        name="maneja_xml"
                                        id="maneja_xml"
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />
                                }
                                label="¿Maneja XML?"
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={ajuste_fin_mes}
                                        color="primary"
                                        onChange={() => setajuste_fin_mes(!ajuste_fin_mes)}
                                        name="ajuste_fin_mes"
                                        id="ajuste_fin_mes"
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />
                                }
                                label="¿Ajuste de fin de mes?"
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={control_numero_factura}
                                        color="primary"
                                        onChange={() => setcontrol_numero_factura(!control_numero_factura)}
                                        name="control_numero_factura"
                                        id="control_numero_factura"
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />
                                }
                                label="¿Control número de Factura?"
                            />
                        </FormControl>
                    </div>
                    <div className="right">
                        <div className="section">
                            <h2>SAP</h2>
                            <FormControl className={classes.formControl} variant="outlined">
                                <Select2
                                    isSearchable={true}
                                    isClearable={true}
                                    onChange={handleChangeSelect}
                                    value={sap_db_type}
                                    name="sap_db_type"
                                    id="sap_db_type"
                                    options={dbTypes}
                                    placeholder="Tipo Base de Datos"
                                />
                            </FormControl>
                            <FormControl className={classes.formControl}>
                                <TextField
                                    fullWidth
                                    id="servidor_licencias"
                                    name="servidor_licencias"
                                    label="Servidor de Licencias"
                                    value={formik.values.servidor_licencias}
                                    onChange={formik.handleChange}
                                    error={formik.touched.servidor_licencias && Boolean(formik.errors.servidor_licencias)}
                                />
                            </FormControl>
                            <FormControl className={classes.formControl}>
                                <TextField
                                    fullWidth
                                    id="usuario_sap"
                                    name="usuario_sap"
                                    label="Usuario SAP"
                                    type="text"
                                    value={formik.values.usuario_sap}
                                    onChange={formik.handleChange}
                                    error={formik.touched.usuario_sap && Boolean(formik.errors.usuario_sap)}
                                />
                            </FormControl>
                            <FormControl className={classes.formControl}>
                                <TextField
                                    fullWidth
                                    id="contrasena_sap"
                                    name="contrasena_sap"
                                    label="Contraseña SAP"
                                    type="text"
                                    value={formik.values.contrasena_sap}
                                    onChange={formik.handleChange}
                                    error={formik.touched.contrasena_sap && Boolean(formik.errors.contrasena_sap)}
                                />
                            </FormControl>
                            <FormControl className={classes.formControl}>
                                <TextField
                                    label="Data Bancos"
                                    multiline
                                    maxRows={8}
                                    value={bancos}
                                    name="bancos"
                                    id="bancos"
                                    onChange={handleChange}
                                    InputProps={{
                                        disabled: true,
                                    }}
                                />
                            </FormControl>
                        </div>
                    </div>
                </form>

                <Button color="primary" variant="contained" className="full-button" fullWidth type="text" onClick={() => formik.submitForm()}>
                    Guardar
                </Button>
            </div>
        </div>
    );
};
export default EmpresaEdit;
