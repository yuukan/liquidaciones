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

const EmpresaEdit = (props) => {
    const [id, setId] = useState(-1);
    const [remanente_nota_credito, setremanente_nota_credito] = useState(false);
    const [maneja_xml, setmaneja_xml] = useState(false);
    const [ajuste_fin_mes, setajuste_fin_mes] = useState(false);
    const [control_numero_factura, setcontrol_numero_factura] = useState(false);

    const classes = useStyles();
    // Pass the useFormik() hook initial form values and a submit function that will
    // be called when the form is submitted
    const formik = useFormik({
        initialValues: {
            nombre: '',
            servidor_licencias: '',
            usuario_sap: '',
            contrasena_sap: '',
            segundos_espera: '',
            ruta_archivos: '',
            usuario_sql: '',
            sap_db_type: '',
            contrasena_sql: '',
            servidor_sql: '',
            codigo_empresa: '',
            moneda_local: '',
            moneda_extranjera: '',
            dias_atraso_facturacion_ruta: '',
            valor_impuesto: '',
            dias_atraso_facturacion_gastos: '',
            no_identificacion_fiscal: '',
            dia_efectivo_ajuste: ''
        },
        onSubmit: values => {
            values.user_id = id;
            values.remanente_nota_credito = remanente_nota_credito ? 1 : 0;
            values.maneja_xml = maneja_xml ? 1 : 0;
            values.ajuste_fin_mes = ajuste_fin_mes ? 1 : 0;
            values.control_numero_factura = control_numero_factura ? 1 : 0;

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
                        props.history.push(`/empresas`);
                    })
                    .catch(function (err) {
                        console.log(err);
                        swal("Error", err.response.data.msg, "error");
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
                        props.history.push(`/empresas`);
                    })
                    .catch(function (err) {
                        console.log(err);
                        swal("Error", err.response.data.msg, "error");
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
                    // formik.setFieldValue('nombre', resp.data.nombre, false);
                    formik.setFieldValue('nombre', resp.data.nombre, false);
                    formik.setFieldValue('servidor_licencias', resp.data.servidor_licencias, false);
                    formik.setFieldValue('usuario_sap', resp.data.usuario_sap, false);
                    formik.setFieldValue('contrasena_sap', resp.data.contrasena_sap, false);
                    formik.setFieldValue('segundos_espera', resp.data.segundos_espera, false);
                    formik.setFieldValue('ruta_archivos', resp.data.ruta_archivos, false);
                    formik.setFieldValue('usuario_sql', resp.data.usuario_sql, false);
                    formik.setFieldValue('sap_db_type', resp.data.sap_db_type, false);
                    formik.setFieldValue('contrasena_sql', resp.data.contrasena_sql, false);
                    formik.setFieldValue('servidor_sql', resp.data.servidor_sql, false);
                    formik.setFieldValue('codigo_empresa', resp.data.codigo_empresa, false);
                    formik.setFieldValue('moneda_local', resp.data.moneda_local, false);
                    formik.setFieldValue('moneda_extranjera', resp.data.moneda_extranjera, false);
                    formik.setFieldValue('dias_atraso_facturacion_ruta', resp.data.dias_atraso_facturacion_ruta, false);
                    formik.setFieldValue('valor_impuesto', resp.data.valor_impuesto, false);
                    formik.setFieldValue('dias_atraso_facturacion_gastos', resp.data.dias_atraso_facturacion_gastos, false);
                    formik.setFieldValue('no_identificacion_fiscal', resp.data.no_identificacion_fiscal, false);
                    formik.setFieldValue('dia_efectivo_ajuste', resp.data.dia_efectivo_ajuste, false);

                    setremanente_nota_credito(resp.data.remanente_nota_credito === 1);
                    setmaneja_xml(resp.data.maneja_xml === 1);
                    setajuste_fin_mes(resp.data.ajuste_fin_mes === 1);
                    setcontrol_numero_factura(resp.data.control_numero_factura === 1);
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
                {
                    typeof props.match.params.id !== "undefined" ? "Editar empresa" : "Crear empresa"
                }
            </Typography>
            <div className="empresa-container">
                <form onSubmit={formik.handleSubmit}>
                    <div className="left">
                        <h2>Datos Empresa</h2>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="codigo_empresa"
                                name="codigo_empresa"
                                label="Código Empresa"
                                value={formik.values.codigo_empresa}
                                onChange={formik.handleChange}
                                error={formik.touched.codigo_empresa && Boolean(formik.errors.codigo_empresa)}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="nombre"
                                name="nombre"
                                label="Nombre"
                                value={formik.values.nombre}
                                onChange={formik.handleChange}
                                error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="moneda_local"
                                name="moneda_local"
                                label="Moneda Local"
                                type="text"
                                value={formik.values.moneda_local}
                                onChange={formik.handleChange}
                                error={formik.touched.moneda_local && Boolean(formik.errors.moneda_local)}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="moneda_extranjera"
                                name="moneda_extranjera"
                                label="Moneda Extranjera"
                                type="text"
                                value={formik.values.moneda_extranjera}
                                onChange={formik.handleChange}
                                error={formik.touched.moneda_extranjera && Boolean(formik.errors.moneda_extranjera)}
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
                                id="valor_impuesto"
                                name="valor_impuesto"
                                label="Valor impuesto"
                                type="number"
                                required
                                value={formik.values.valor_impuesto}
                                onChange={formik.handleChange}
                                error={formik.touched.valor_impuesto && Boolean(formik.errors.valor_impuesto)}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="no_identificacion_fiscal"
                                name="no_identificacion_fiscal"
                                label="Número de identificación fiscal"
                                type="text"
                                value={formik.values.no_identificacion_fiscal}
                                onChange={formik.handleChange}
                                error={formik.touched.no_identificacion_fiscal && Boolean(formik.errors.no_identificacion_fiscal)}
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
                                    id="bd_sap"
                                    name="bd_sap"
                                    label="Bases de Datos SAP"
                                    type="text"
                                    value={formik.values.bd_sap}
                                    onChange={formik.handleChange}
                                    error={formik.touched.bd_sap && Boolean(formik.errors.bd_sap)}
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
                                    fullWidth
                                    id="segundos_espera"
                                    name="segundos_espera"
                                    label="Segundos de espera"
                                    type="text"
                                    value={formik.values.segundos_espera}
                                    onChange={formik.handleChange}
                                    error={formik.touched.segundos_espera && Boolean(formik.errors.segundos_espera)}
                                />
                            </FormControl>
                            <FormControl className={classes.formControl}>
                                <TextField
                                    fullWidth
                                    id="ruta_archivos"
                                    name="ruta_archivos"
                                    label="Ruta de Archivos"
                                    type="text"
                                    value={formik.values.ruta_archivos}
                                    onChange={formik.handleChange}
                                    error={formik.touched.ruta_archivos && Boolean(formik.errors.ruta_archivos)}
                                />
                            </FormControl>
                            <FormControl className={classes.formControl}>
                                <TextField
                                    fullWidth
                                    id="segundos_espera"
                                    name="segundos_espera"
                                    label="Segundos de espera"
                                    type="text"
                                    value={formik.values.segundos_espera}
                                    onChange={formik.handleChange}
                                    error={formik.touched.segundos_espera && Boolean(formik.errors.segundos_espera)}
                                />
                            </FormControl>
                        </div>
                        <div className="section">
                            <h2>SQL</h2>
                            <FormControl className={classes.formControl}>
                                <TextField
                                    fullWidth
                                    id="usuario_sql"
                                    name="usuario_sql"
                                    label="Usuario SQL"
                                    type="text"
                                    value={formik.values.usuario_sql}
                                    onChange={formik.handleChange}
                                    error={formik.touched.usuario_sql && Boolean(formik.errors.usuario_sql)}
                                />
                            </FormControl>
                            <FormControl className={classes.formControl}>
                                <TextField
                                    fullWidth
                                    id="sap_db_type"
                                    name="sap_db_type"
                                    label="Tipo Base de Datos"
                                    type="text"
                                    value={formik.values.sap_db_type}
                                    onChange={formik.handleChange}
                                    error={formik.touched.sap_db_type && Boolean(formik.errors.sap_db_type)}
                                />
                            </FormControl>
                            <FormControl className={classes.formControl}>
                                <TextField
                                    fullWidth
                                    id="contrasena_sql"
                                    name="contrasena_sql"
                                    label="Contraseña SQL"
                                    type="text"
                                    value={formik.values.contrasena_sql}
                                    onChange={formik.handleChange}
                                    error={formik.touched.contrasena_sql && Boolean(formik.errors.contrasena_sql)}
                                />
                            </FormControl>
                            <FormControl className={classes.formControl}>
                                <TextField
                                    fullWidth
                                    id="servidor_sql"
                                    name="servidor_sql"
                                    label="Servidor SQL"
                                    type="text"
                                    value={formik.values.servidor_sql}
                                    onChange={formik.handleChange}
                                    error={formik.touched.servidor_sql && Boolean(formik.errors.servidor_sql)}
                                />
                            </FormControl>
                        </div>
                    </div>
                </form>

                <Button color="primary" variant="contained" className="full-button" fullWidth type="text" onClick={() => formik.submitForm()}>
                    Guardar Usuario
                </Button>
            </div>
        </div>
    );
};
export default EmpresaEdit;