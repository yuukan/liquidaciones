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
import { Link } from 'react-router-dom';
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

const BancoEdit = (props) => {
    const [id, setId] = useState(-1);
    const [empresa, setEmpresa] = useState(false);

    const classes = useStyles();
    // Pass the useFormik() hook initial form values and a submit function that will
    // be called when the form is submitted
    const formik = useFormik({
        initialValues: {
            nombre: '',
            codigo_banco_sap: '',
            codigo_banco_file: '',
            ruta_archivos: '',
        },
        onSubmit: values => {
            values.user_id = id;
            values.empresa = empresa;

            let data = JSON.stringify(values);

            if (id === -1) {
                axios({
                    method: 'post',
                    url: props.url + 'banco',
                    data,
                    responseType: "json",
                    headers: { "Content-Type": "application/json" }
                })
                    .then(function (resp) {
                        swal("Éxito", resp.data.msg, "success");
                        props.loadBancos();
                        props.history.push(`/bancos`);
                    })
                    .catch(function (err) {
                        console.log(err);
                        swal("Error", err.response.data.msg, "error");
                    });
            } else {
                axios({
                    method: 'put',
                    url: props.url + 'banco/' + id,
                    data,
                    responseType: "json",
                    headers: { "Content-Type": "application/json" }
                })
                    .then(function (resp) {
                        swal("Éxito", resp.data.msg, "success");
                        props.loadBancos();
                        props.history.push(`/bancos`);
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
    }

    useEffect(() => {
        if (typeof props.match.params.id !== "undefined") {
            setId(props.match.params.id);
            axios({
                method: 'get',
                url: props.url + 'banco/' + props.match.params.id,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    // formik.setFieldValue('nombre', resp.data.nombre, false);
                    formik.setFieldValue('nombre', resp.data.nombre, false);
                    formik.setFieldValue('codigo_banco_sap', resp.data.codigo_banco_sap, false);
                    formik.setFieldValue('codigo_banco_file', resp.data.codigo_banco_file, false);
                    formik.setFieldValue('ruta_archivos', resp.data.ruta_archivos, false);

                    setEmpresa(
                        {
                            "value": resp.data.id_empresa,
                            "label": resp.data.empresa
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
                <Link className="link" to="/bancos">
                    <ArrowBackIosIcon />
                </Link>
                {
                    typeof props.match.params.id !== "undefined" ? "Editar banco" : "Crear banco"
                }
            </Typography>
            <div className="empresa-container">
                <form onSubmit={formik.handleSubmit}>
                    <div className="left">
                        <h2>Datos Banco</h2>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="nombre"
                                name="nombre"
                                type="text"
                                label="Nombre del banco"
                                value={formik.values.nombre}
                                onChange={formik.handleChange}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="codigo_banco_sap"
                                name="codigo_banco_sap"
                                type="text"
                                label="Código Banco SAP"
                                value={formik.values.codigo_banco_sap}
                                onChange={formik.handleChange}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="codigo_banco_file"
                                name="codigo_banco_file"
                                type="text"
                                label="Código Archivo Banco"
                                value={formik.values.codigo_banco_file}
                                onChange={formik.handleChange}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="ruta_archivos"
                                name="ruta_archivos"
                                type="text"
                                label="Ruta de Archivos"
                                value={formik.values.ruta_archivos}
                                onChange={formik.handleChange}
                            />
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
export default BancoEdit;
