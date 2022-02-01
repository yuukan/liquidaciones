import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import { useFormik } from 'formik';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Select2 from 'react-select';
import { makeStyles } from '@material-ui/core/styles';
import swal from 'sweetalert';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Delete } from '@material-ui/icons/';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Grid from '@material-ui/core/Grid';
import { Switch } from '@material-ui/core';

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

const PresupuestoEdit = (props) => {
    const [id, setId] = useState(-1);
    const [sub, setSub] = useState([]);

    const [empresa, setEmpresa] = useState(false);
    const [moneda, setMoneda] = useState(false);
    const [monedas, setMonedas] = useState(false);
    const [tipo_gasto, setTipoGasto] = useState(false);
    // Sub
    const [categoria_gasto, setCategoriaGasto] = useState(false);
    const [tipo_asignacion, setTipoAsignacion] = useState('dinero');
    const [frecuencia, setFrecuencia] = useState(false);
    const [activo, setActivo] = useState(false);
    const [disableEmpresa, setDisableEmpresa] = useState(false);

    const classes = useStyles();
    // Pass the useFormik() hook initial form values and a submit function that will
    // be called when the form is submitted
    const formik = useFormik({
        initialValues: {
            nombre: '',
            monto_maximo_factura: '',
            asignacion_cantidad: '',
            asignacion_medida: ''
        },
        onSubmit: values => {
            values.user_id = id;

            if (
                values.descripcion === '' ||
                !empresa
            ) {
                swal("Error", "¡Debes llenar todos los datos!", "error");
            } else {


                values.moneda_codigo = moneda.value;
                values.moneda_nombre = moneda.label;
                values.empresa_codigo = empresa.value;
                values.empresa_nombre = empresa.label;
                values.tipo_gasto_codigo = tipo_gasto.value;
                values.tipo_gasto_nombre = tipo_gasto.label;

                values.activo = activo ? 1 : 0;

                values.sub = sub;

                let data = JSON.stringify(values);

                if (id === -1) {
                    axios({
                        method: 'post',
                        url: props.url + 'presupuesto',
                        data,
                        responseType: "json",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(function (resp) {
                            swal("Éxito", resp.data.msg, "success");
                            props.loadPresupuestos();
                            props.history.push(`/presupuestos`);
                        })
                        .catch(function (err) {
                            console.log(err);
                            swal("Error", err.response.data.msg, "error");
                        });
                } else {
                    axios({
                        method: 'put',
                        url: props.url + 'presupuesto/' + id,
                        data,
                        responseType: "json",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(function (resp) {
                            swal("Éxito", resp.data.msg, "success");
                            props.loadPresupuestos();
                            props.history.push(`/presupuestos`);
                        })
                        .catch(function (err) {
                            console.log(err);
                            swal("Error", err.response.data.msg, "error");
                        });
                }
            }

        },
    });

    const handleChangeTipo = (event) => {
        setTipoAsignacion(event.target.value);
    };

    const removeSub = (idx) => {
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
                        let e = [...sub];
                        e.splice(idx, 1);
                        setSub(e);
                    }
                });
        }
    }

    const addSub = () => {
        let es = [...sub];

        if (
            !categoria_gasto ||
            !frecuencia ||
            formik.values.asignacion_cantidad === "" ||
            (tipo_asignacion !== "dinero" && formik.values.asignacion_medida === "")
        ) {
            swal("Error", "¡Debes llenar todos los datos!", "error");
        } else {
            let exists = 0;
            for (let i = 0; i < es.length; i++) {
                if (es[i].categoria_gasto_codigo === categoria_gasto.value) {
                    exists = 1;
                    break;
                }
            }
            if (exists === 1) {
                swal("Error", "¡Ya existe este sub gasto agregado al presupuesto!", "error");
            } else {
                es.push({
                    'categoria_gasto_codigo': categoria_gasto.value,
                    'categoria_gasto_nombre': categoria_gasto.label,
                    'tipo_asignacion': tipo_asignacion,
                    'asignacion_cantidad': formik.values.asignacion_cantidad,
                    'asignacion_medida': formik.values.asignacion_medida,
                    'frecuencia_codigo': frecuencia.value,
                    'frecuencia_nombre': frecuencia.label,
                    'au_presupuesto_id': id
                });

                setSub(es);

                formik.setFieldValue('asignacion_cantidad', '', false);
                formik.setFieldValue('asignacion_medida', '', false);
                setTipoAsignacion('dinero');
                setCategoriaGasto(false);
                setFrecuencia(false);
            }
        }
    }

    const handleChangeSelect = (option, b) => {
        if (b.name === "empresa") {
            setEmpresa(option);

            let monedas = [
                {
                    value: option.moneda_local,
                    label: option.moneda_local
                },
                {
                    value: option.moneda_extranjera,
                    label: option.moneda_extranjera
                }
            ];

            setMonedas(monedas);
            setMoneda(false);
            setTipoGasto(false);
            setCategoriaGasto(false);
            setFrecuencia(false);
            setActivo(false);
            formik.setFieldValue('monto_maximo_factura', '', false);
            setSub([]);
        }
        if (b.name === "moneda") {
            setMoneda(option);
        }
        if (b.name === "tipo_gasto") {
            setTipoGasto(option);
        }
        if (b.name === "categoria_gasto") {
            setCategoriaGasto(option);
        }
        if (b.name === "frecuencia") {
            setFrecuencia(option);
        }
    }

    useEffect(() => {
        if (typeof props.match.params.id !== "undefined") {
            setDisableEmpresa(true);
            setId(props.match.params.id);
            axios({
                method: 'get',
                url: props.url + 'presupuesto/' + props.match.params.id,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    formik.setFieldValue('nombre', resp.data.nombre, false);
                    formik.setFieldValue('monto_maximo_factura', resp.data.monto_maximo_factura, false);

                    setActivo(resp.data.activo === 1);

                    setEmpresa(
                        {
                            "value": resp.data.empresa_codigo,
                            "label": resp.data.empresa_nombre
                        }
                    );

                    setMonedas(
                        [
                            {
                                "value": resp.data.moneda_codigo,
                                "label": resp.data.moneda_nombre
                            }
                        ]
                    );

                    setMoneda(
                        {
                            "value": resp.data.moneda_codigo,
                            "label": resp.data.moneda_nombre
                        }

                    );

                    setTipoGasto(
                        {
                            "value": resp.data.tipo_gasto_codigo,
                            "label": resp.data.tipo_gasto_nombre
                        }

                    );

                    setSub(resp.data.sub);

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
                <Link className="link" to="/presupuestos">
                    <ArrowBackIosIcon />
                </Link>
                {
                    typeof props.match.params.id !== "undefined" ? "Editar presupuesto" : "Crear presupuesto"
                }
            </Typography>
            <div className="empresa-container">
                <form onSubmit={formik.handleSubmit}>
                    <div className="left">
                        <h2>Datos Presupuesto</h2>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="nombre"
                                name="nombre"
                                type="text"
                                label="Nombre Presupuesto"
                                value={formik.values.nombre}
                                onChange={formik.handleChange}
                            />
                        </FormControl>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <label htmlFor="empresa" className="manual">
                                Empresa
                            </label>
                            <Select2
                                isSearchable={true}
                                isDisabled={disableEmpresa}
                                onChange={handleChangeSelect}
                                value={empresa}
                                name="empresa"
                                id="empresa"
                                options={props.empresas}
                                placeholder="*Seleccione empresa"
                            />
                        </FormControl>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <label htmlFor="moneda" className="manual">
                                Moneda
                            </label>
                            <Select2
                                isSearchable={true}
                                onChange={handleChangeSelect}
                                value={moneda}
                                name="moneda"
                                id="moneda"
                                options={monedas}
                                placeholder="*Seleccione moneda"
                            />
                        </FormControl>

                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="monto_maximo_factura"
                                name="monto_maximo_factura"
                                type="number"
                                label="Monto máximo factura"
                                value={formik.values.monto_maximo_factura}
                                onChange={formik.handleChange}
                            />
                        </FormControl>

                        <FormControl variant="outlined" className={classes.formControl}>
                            <label htmlFor="tipo_gasto" className="manual">
                                Tipo Gasto
                            </label>
                            <Select2
                                isSearchable={true}
                                onChange={handleChangeSelect}
                                value={tipo_gasto}
                                name="tipo_gasto"
                                id="tipo_gasto"
                                options={props.tipo_gastos}
                                placeholder="*Seleccione tipo gasto"
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={activo}
                                        color="primary"
                                        onChange={() => setActivo(!activo)}
                                        name="activo"
                                        id="activo"
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />
                                }
                                label="Activo"
                            />
                        </FormControl>
                    </div>
                </form>

                <div className="full">
                    <Grid container spacing={2}>
                        <Grid item xs={2} className="fix-top">
                            <FormControl variant="outlined" className={classes.formControl}>
                                <Select2
                                    isSearchable={true}
                                    onChange={handleChangeSelect}
                                    value={categoria_gasto}
                                    name="categoria_gasto"
                                    id="categoria_gasto"
                                    options={props.categoria_gastos}
                                    placeholder="*Gasto"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={2} className="fix-top">
                            <FormControl component="fieldset">
                                <RadioGroup
                                    row
                                    aria-label="Tipo"
                                    name="tipo_asignacion"
                                    defaultValue="dinero"
                                    onChange={handleChangeTipo}
                                    value={tipo_asignacion}
                                >
                                    <FormControlLabel value="dinero" control={<Radio />} label="Dinero" />
                                    <FormControlLabel value="unidad" control={<Radio />} label="Unidad" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                            <FormControl className={classes.formControl}>
                                <TextField
                                    id="asignacion_cantidad"
                                    name="asignacion_cantidad"
                                    type="number"
                                    label="* Asignacion Cantidad"
                                    value={formik.values.asignacion_cantidad}
                                    onChange={formik.handleChange}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                            {
                                tipo_asignacion !== "dinero" ?
                                    (
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                id="asignacion_medida"
                                                name="asignacion_medida"
                                                type="text"
                                                label="Asignacion medida"
                                                value={formik.values.asignacion_medida}
                                                onChange={formik.handleChange}
                                            />
                                        </FormControl>
                                    ) : ""
                            }
                        </Grid>
                        <Grid item xs={2} className="fix-top">
                            <FormControl variant="outlined" className={classes.formControl}>
                                <Select2
                                    isSearchable={true}
                                    onChange={handleChangeSelect}
                                    value={frecuencia}
                                    name="frecuencia"
                                    id="frecuencia"
                                    options={props.frecuencia_gastos}
                                    placeholder="*Frecuencia"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={2} className="fix-top">
                            <Button color="primary" variant="contained" fullWidth type="button" onClick={addSub}>
                                Agregar
                            </Button>
                        </Grid>
                    </Grid>
                    <div className="table-container">
                        <table className="detail-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '16.66%' }}>
                                        Categoría
                                    </th>
                                    <th style={{ width: '16.66%' }}>
                                        Tipo Asignación
                                    </th>
                                    <th style={{ width: '16.66%' }}>
                                        Cantidad
                                    </th>
                                    <th style={{ width: '16.66%' }}>
                                        Medida
                                    </th>
                                    <th style={{ width: '16.66%' }}>
                                        Frecuencia
                                    </th>
                                    <th style={{ width: '16.66%' }}>
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            {sub && sub.length > 0
                                ?
                                (
                                    <tbody>
                                        {
                                            sub.map((key, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        {key.categoria_gasto_nombre}
                                                    </td>
                                                    <td>
                                                        {key.tipo_asignacion}
                                                    </td>
                                                    <td>
                                                        {key.asignacion_cantidad}
                                                    </td>
                                                    <td>
                                                        {key.asignacion_medida}
                                                    </td>
                                                    <td>
                                                        {key.frecuencia_nombre}
                                                    </td>
                                                    <td>
                                                        <Button
                                                            color="secondary"
                                                            variant="contained"
                                                            fullWidth
                                                            type="button"
                                                            className="horizontal-btn-fix"
                                                            onClick={() => removeSub(idx)}
                                                        >
                                                            <Delete />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                )
                                : ""}
                        </table>
                    </div>
                </div>

                <Button color="primary" variant="contained" className="full-button" fullWidth type="text" onClick={() => formik.submitForm()}>
                    Guardar
                </Button>
            </div>
        </div>
    );
};
export default PresupuestoEdit;
