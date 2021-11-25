import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import { useFormik } from 'formik';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
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

const GastoEdit = (props) => {
    const [id, setId] = useState(-1);
    const [grupo, setGrupo] = useState(null);
    const [sub, setSub] = useState([]);
    const [cuentas_contables_exento, setContablesExento] = useState(false);
    const [codigo_impuesto_exento, setImpuestoExento] = useState(false);
    const [cuentas_contables_afecto, setContablesAfecto] = useState(false);
    const [codigo_impuesto_afecto, setImpuestoAfecto] = useState(false);
    const [cuentas_contables_remanente, setContablesRemanente] = useState(false);
    const [codigo_impuesto_remanente, setImpuestoRemanente] = useState(false);
    const [depreciacion, setDepreciacion] = useState(false);
    const [control_combustible, setCombustible] = useState(false);
    const [control_kilometraje, setKilometraje] = useState(false);
    const [lleva_subgastos, setLleva] = useState(false);
    const [exento_sub, setExentoSub] = useState(false);
    const [tipo, setTipo] = useState('cantidad');
    const [empresa, setEmpresa] = useState(false);

    const classes = useStyles();
    // Pass the useFormik() hook initial form values and a submit function that will
    // be called when the form is submitted
    const formik = useFormik({
        initialValues: {
            descripcion: '',
            descripcion_sub: '',
            valor_sub: ''
        },
        onSubmit: values => {
            values.user_id = id;

            if (
                values.descripcion === '' ||
                !empresa ||
                grupo === null
            ) {
                swal("Error", "¡Debes llenar todos los datos!", "error");
            } else {

                values.au_gasto_grupo_id = grupo.value;
                values.au_gasto_grupo_nombre = grupo.label;
                values.depreciacion = depreciacion;
                values.control_combustible = control_combustible ? 1 : 0;
                values.control_kilometraje = control_kilometraje ? 1 : 0;
                values.lleva_subgastos = lleva_subgastos ? 1 : 0;
                values.exento_codigo = cuentas_contables_exento.value;
                values.exento_nombre = cuentas_contables_exento.label;
                values.afecto_codigo = cuentas_contables_afecto.value;
                values.afecto_nombre = cuentas_contables_afecto.label;
                values.remanente_codigo = cuentas_contables_remanente.value;
                values.remanente_nombre = cuentas_contables_remanente.label;
                values.exento_impuesto_codigo = codigo_impuesto_exento.value;
                values.exento_impuesto_nombre = codigo_impuesto_exento.label;
                values.afecto_impuesto_codigo = codigo_impuesto_afecto.value;
                values.afecto_impuesto_nombre = codigo_impuesto_afecto.label;
                values.remanente_impuesto_codigo = codigo_impuesto_remanente.value;
                values.remanente_impuesto_nombre = codigo_impuesto_remanente.label;
                values.empresa_codigo = empresa.value;
                values.empresa_nombre = empresa.label;

                values.sub = sub;

                let data = JSON.stringify(values);

                if (id === -1) {
                    axios({
                        method: 'post',
                        url: props.url + 'gasto',
                        data,
                        responseType: "json",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(function (resp) {
                            swal("Éxito", resp.data.msg, "success");
                            props.loadGastos();
                            props.cleanSAPEmpresa();
                            props.history.push(`/gastos`);
                        })
                        .catch(function (err) {
                            console.log(err);
                            swal("Error", err.response.data.msg, "error");
                        });
                } else {
                    axios({
                        method: 'put',
                        url: props.url + 'gasto/' + id,
                        data,
                        responseType: "json",
                        headers: { "Content-Type": "application/json" }
                    })
                        .then(function (resp) {
                            swal("Éxito", resp.data.msg, "success");
                            props.loadGastos();
                            props.cleanSAPEmpresa();
                            props.history.push(`/gastos`);
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
        setTipo(event.target.value);
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
            formik.values.descripcion_sub === "" ||
            formik.values.valor_sub === ""
        ) {
            swal("Error", "¡Debes llenar todos los datos!", "error");
        } else {
            es.push({
                'descripcion': formik.values.descripcion_sub,
                'au_gasto_id': id,
                'exento': exento_sub,
                'tipo': tipo,
                'valor': formik.values.valor_sub
            });

            setSub(es);

            setTipo('cantidad');
            setExentoSub(false);
            formik.setFieldValue('descripcion_sub', '', false);
            formik.setFieldValue('valor_sub', '', false);
        }
    }

    const handleChangeSelect = (option, b) => {
        if (b.name === "grupo") {
            setGrupo(option);
        }
        if (b.name === "cuentas_contables_exento") {
            setContablesExento(option);
        }
        if (b.name === "codigo_impuesto_exento") {
            setImpuestoExento(option);
        }
        if (b.name === "cuentas_contables_afecto") {
            setContablesAfecto(option);
        }
        if (b.name === "codigo_impuesto_afecto") {
            setImpuestoAfecto(option);
        }
        if (b.name === "cuentas_contables_remanente") {
            setContablesRemanente(option);
        }
        if (b.name === "codigo_impuesto_remanente") {
            setImpuestoRemanente(option);
        }
        if (b.name === "empresa") {
            setEmpresa(option);
            props.loadSAPEmpresa(option.value);
        }
    }

    useEffect(() => {
        if (typeof props.match.params.id !== "undefined") {
            setId(props.match.params.id);
            axios({
                method: 'get',
                url: props.url + 'gasto/' + props.match.params.id,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    // formik.setFieldValue('nombre', resp.data.nombre, false);
                    formik.setFieldValue('descripcion', resp.data.descripcion, false);

                    setGrupo(
                        {
                            "value": resp.data.au_gasto_grupo_id,
                            "label": resp.data.au_gasto_grupo_nombre
                        }
                    );

                    setDepreciacion(resp.data.depreciacion === 1);
                    setCombustible(resp.data.control_combustible === 1);
                    setKilometraje(resp.data.control_kilometraje === 1);
                    setLleva(resp.data.lleva_subgastos === 1);

                    setContablesExento(
                        {
                            "value": resp.data.exento_codigo,
                            "label": resp.data.exento_nombre
                        }
                    );

                    setImpuestoExento(
                        {
                            "value": resp.data.exento_impuesto_codigo,
                            "label": resp.data.exento_impuesto_nombre
                        }
                    );

                    setContablesAfecto(
                        {
                            "value": resp.data.afecto_codigo,
                            "label": resp.data.afecto_nombre
                        }
                    );

                    setImpuestoAfecto(
                        {
                            "value": resp.data.afecto_impuesto_codigo,
                            "label": resp.data.afecto_impuesto_nombre
                        }
                    );

                    setContablesRemanente(
                        {
                            "value": resp.data.remanente_codigo,
                            "label": resp.data.remanente_nombre
                        }
                    );

                    setImpuestoRemanente(
                        {
                            "value": resp.data.remanente_impuesto_codigo,
                            "label": resp.data.remanente_impuesto_nombre
                        }
                    );

                    setEmpresa(
                        {
                            "value": resp.data.empresa_codigo,
                            "label": resp.data.empresa_nombre
                        }
                    );

                    props.loadSAPEmpresa(resp.data.empresa_codigo);

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
                <Link className="link" to="/gastos">
                    <ArrowBackIosIcon />
                </Link>
                {
                    typeof props.match.params.id !== "undefined" ? "Editar gasto" : "Crear gasto"
                }
            </Typography>
            <div className="empresa-container">
                <form onSubmit={formik.handleSubmit}>
                    <div className="left">
                        <h2>Datos Gastos</h2>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <label htmlFor="empresa" className="manual">
                                Empresa
                            </label>
                            <Select2
                                isSearchable={true}
                                onChange={handleChangeSelect}
                                value={empresa}
                                name="empresa"
                                id="empresa"
                                options={props.empresas}
                                placeholder="*Seleccione Empresa"
                            />
                        </FormControl>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <label htmlFor="grupo" className="manual">
                                Seleccione Grupo
                            </label>
                            <Select2
                                isSearchable={true}
                                onChange={handleChangeSelect}
                                value={grupo}
                                name="grupo"
                                id="grupo"
                                options={props.grupos}
                                placeholder="*Seleccione Grupo"
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="descripcion"
                                name="descripcion"
                                type="text"
                                label="Descripción Gasto"
                                value={formik.values.descripcion}
                                onChange={formik.handleChange}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={depreciacion}
                                        color="primary"
                                        onChange={() => setDepreciacion(!depreciacion)}
                                        name="depreciacion"
                                        id="depreciacion"
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />
                                }
                                label="Depreciación"
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={control_combustible}
                                        color="primary"
                                        onChange={() => setCombustible(!control_combustible)}
                                        name="control_combustible"
                                        id="control_combustible"
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />
                                }
                                label="Control Comustible"
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={control_kilometraje}
                                        color="primary"
                                        onChange={() => setKilometraje(!control_kilometraje)}
                                        name="control_kilometraje"
                                        id="control_kilometraje"
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />
                                }
                                label="Control Kilometraje"
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={lleva_subgastos}
                                        color="primary"
                                        onChange={() => setLleva(!lleva_subgastos)}
                                        name="lleva_subgastos"
                                        id="lleva_subgastos"
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />
                                }
                                label="Lleva Subgastos"
                            />
                        </FormControl>
                    </div>
                    <div className="right">
                        {
                            props.loading ?
                                (
                                    <img src="./images/loading.gif" alt="" />
                                ) :
                                props.cuentas_contables.length > 0 && props.impuestos.length > 0 ?
                                    (
                                        <React.Fragment>
                                            <div className="section">
                                                <h2>
                                                    Exento
                                                </h2>
                                                <FormControl variant="outlined" className={classes.formControl}>
                                                    <label htmlFor="cuentas_contables_exento" className="manual">
                                                        Cuenta Contable
                                                    </label>
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={cuentas_contables_exento}
                                                        name="cuentas_contables_exento"
                                                        id="cuentas_contables_exento"
                                                        options={props.cuentas_contables}
                                                        placeholder="*Cuenta Contable"
                                                    />
                                                </FormControl>
                                                <FormControl variant="outlined" className={classes.formControl}>
                                                    <label htmlFor="codigo_impuesto_exento" className="manual">
                                                        Código Impuesto
                                                    </label>
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={codigo_impuesto_exento}
                                                        name="codigo_impuesto_exento"
                                                        id="codigo_impuesto_exento"
                                                        options={props.impuestos}
                                                        placeholder="*Impuesto"
                                                    />
                                                </FormControl>
                                            </div>
                                            <div className="section">
                                                <h2>
                                                    Afecto
                                                </h2>
                                                <FormControl variant="outlined" className={classes.formControl}>
                                                    <label htmlFor="cuentas_contables_afecto" className="manual">
                                                        Cuenta Contable
                                                    </label>
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={cuentas_contables_afecto}
                                                        name="cuentas_contables_afecto"
                                                        id="cuentas_contables_afecto"
                                                        options={props.cuentas_contables}
                                                        placeholder="*Cuenta Contable"
                                                    />
                                                </FormControl>
                                                <FormControl variant="outlined" className={classes.formControl}>
                                                    <label htmlFor="codigo_impuesto_exento" className="manual">
                                                        Código Impuesto
                                                    </label>
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={codigo_impuesto_afecto}
                                                        name="codigo_impuesto_afecto"
                                                        id="codigo_impuesto_afecto"
                                                        options={props.impuestos}
                                                        placeholder="*Impuesto"
                                                    />
                                                </FormControl>
                                            </div>
                                            <div className="section">
                                                <h2>
                                                    Remanente
                                                </h2>
                                                <FormControl variant="outlined" className={classes.formControl}>
                                                    <label htmlFor="cuentas_contables_remanente" className="manual">
                                                        Cuenta Contable
                                                    </label>
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={cuentas_contables_remanente}
                                                        name="cuentas_contables_remanente"
                                                        id="cuentas_contables_remanente"
                                                        options={props.cuentas_contables}
                                                        placeholder="*Cuenta Contable"
                                                    />
                                                </FormControl>
                                                <FormControl variant="outlined" className={classes.formControl}>
                                                    <label htmlFor="codigo_impuesto_remanente" className="manual">
                                                        Código Impuesto
                                                    </label>
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={codigo_impuesto_remanente}
                                                        name="codigo_impuesto_remanente"
                                                        id="codigo_impuesto_remanente"
                                                        options={props.impuestos}
                                                        placeholder="*Impuesto"
                                                    />
                                                </FormControl>
                                            </div>
                                        </React.Fragment>
                                    ) : ""
                        }
                    </div>
                </form>

                {
                    lleva_subgastos ?
                        (


                            <div className="full">
                                <Grid container spacing={2}>
                                    <Grid item xs={3}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                id="descripcion_sub"
                                                name="descripcion_sub"
                                                type="text"
                                                label="Descripción Subgasto"
                                                value={formik.values.descripcion_sub}
                                                onChange={formik.handleChange}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={2} className="fix-top">
                                        <FormControl className={classes.formControl}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={exento_sub}
                                                        color="primary"
                                                        onChange={() => setExentoSub(!exento_sub)}
                                                        name="exento_sub"
                                                        id="exento_sub"
                                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                    />
                                                }
                                                label="Exento"
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={3} className="fix-top">
                                        <FormControl component="fieldset">
                                            <RadioGroup
                                                row
                                                aria-label="Tipo"
                                                name="tipo"
                                                defaultValue="cantidad"
                                                onChange={handleChangeTipo}
                                            >
                                                <FormControlLabel value="cantidad" control={<Radio />} label="Cantidad" />
                                                <FormControlLabel value="porcentaje" control={<Radio />} label="Porcentaje" />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                id="valor_sub"
                                                name="valor_sub"
                                                type="text"
                                                label="Valor Subgasto"
                                                value={formik.values.valor_sub}
                                                onChange={formik.handleChange}
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
                                                <th>
                                                    Descripcion
                                                </th>
                                                <th>
                                                    Exento
                                                </th>
                                                <th>
                                                    Tipo
                                                </th>
                                                <th>
                                                    Valor
                                                </th>
                                                <th>
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
                                                                    {key.descripcion}
                                                                </td>
                                                                <td>
                                                                    {!key.exento ? "no" : "si"}
                                                                </td>
                                                                <td>
                                                                    {key.tipo}
                                                                </td>
                                                                <td>
                                                                    {key.valor}
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
                        ) : ""
                }
                <Button color="primary" variant="contained" className="full-button" fullWidth type="text" onClick={() => formik.submitForm()}>
                    Guardar
                </Button>
            </div>
        </div>
    );
};
export default GastoEdit;
