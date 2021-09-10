import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import { useFormik } from 'formik';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Select2 from 'react-select';
import { makeStyles } from '@material-ui/core/styles';
import swal from 'sweetalert';
import axios from 'axios';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

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

const CuentaEdit = (props) => {
    const [id, setId] = useState(-1);
    const [empresa, setEmpresa] = useState(false);
    const [banco, setBanco] = useState(false);

    const classes = useStyles();
    // Pass the useFormik() hook initial form values and a submit function that will
    // be called when the form is submitted
    const formik = useFormik({
        initialValues: {
            numero_cuenta: '',
            numero_cuenta_sap: ''
        },
        onSubmit: values => {
            values.user_id = id;
            values.empresa = empresa;
            values.banco = banco;

            let data = JSON.stringify(values);

            if (id === -1) {
                axios({
                    method: 'post',
                    url: props.url + 'cuenta',
                    data,
                    responseType: "json",
                    headers: { "Content-Type": "application/json" }
                })
                    .then(function (resp) {
                        swal("Éxito", resp.data.msg, "success");
                        props.loadCuentas();
                        props.history.push(`/cuentas`);
                    })
                    .catch(function (err) {
                        console.log(err);
                        swal("Error", err.response.data.msg, "error");
                    });
            } else {
                axios({
                    method: 'put',
                    url: props.url + 'cuenta/' + id,
                    data,
                    responseType: "json",
                    headers: { "Content-Type": "application/json" }
                })
                    .then(function (resp) {
                        swal("Éxito", resp.data.msg, "success");
                        props.loadCuentas();
                        props.history.push(`/cuentas`);
                    })
                    .catch(function (err) {
                        console.log(err);
                        swal("Error", err.response.data.msg, "error");
                    });
            }

        },
    });

    const handleChangeSelect = (option, b) => {
        if (b.name === "empresa") {
            setEmpresa(option);
        }
        if (b.name === "banco") {
            setBanco(option);
        }
    }

    useEffect(() => {
        if (typeof props.match.params.id !== "undefined") {
            setId(props.match.params.id);
            axios({
                method: 'get',
                url: props.url + 'cuentas/' + props.match.params.id,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    // formik.setFieldValue('nombre', resp.data.nombre, false);
                    formik.setFieldValue('numero_cuenta', resp.data.numero_cuenta, false);
                    formik.setFieldValue('numero_cuenta_sap', resp.data.numero_cuenta_sap, false);

                    setEmpresa(
                        {
                            "value": resp.data.id_empresa,
                            "label": resp.data.empresa
                        }
                    );

                    setBanco(
                        {
                            "value": resp.data.id_banco,
                            "label": resp.data.banco
                        }
                    );

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
                <Link className="link" to="/cuentas">
                    <ArrowBackIosIcon />
                </Link>
                {
                    typeof props.match.params.id !== "undefined" ? "Editar cuenta" : "Crear cuenta"
                }
            </Typography>
            <div className="empresa-container">
                <form onSubmit={formik.handleSubmit}>
                    <div className="left">
                        <h2>Datos Cuenta</h2>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="numero_cuenta"
                                name="numero_cuenta"
                                type="text"
                                label="Número de Cuenta"
                                value={formik.values.numero_cuenta}
                                onChange={formik.handleChange}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="numero_cuenta_sap"
                                name="numero_cuenta_sap"
                                type="text"
                                label="Número de Cuenta SAP"
                                value={formik.values.numero_cuenta_sap}
                                onChange={formik.handleChange}
                            />
                        </FormControl>

                        <FormControl className={classes.formControl}>
                            <FormControl variant="outlined" className="form-item">
                                <Select2
                                    isSearchable={true}
                                    onChange={handleChangeSelect}
                                    value={banco}
                                    name="banco"
                                    id="banco"
                                    options={props.bancos}
                                    placeholder="*Selecciones banco"
                                />
                            </FormControl>
                        </FormControl>

                        <FormControl className={classes.formControl}>
                            <FormControl variant="outlined" className="form-item">
                                <Select2
                                    isSearchable={true}
                                    onChange={handleChangeSelect}
                                    value={empresa}
                                    name="empresa"
                                    id="empresa"
                                    options={props.empresas}
                                    placeholder="*Selecciones empresa"
                                />
                            </FormControl>
                        </FormControl>
                    </div>
                </form>

                <Button color="primary" variant="contained" className="full-button" fullWidth type="text" onClick={() => formik.submitForm()}>
                    Guardar
                </Button>
            </div>
        </div>
    );
};
export default CuentaEdit;
