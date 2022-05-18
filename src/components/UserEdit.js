import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import { useFormik } from 'formik';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Select2 from 'react-select';
import { makeStyles } from '@material-ui/core/styles';
import TableUsuariosEmpresas from './sub/TableUsuariosEmpresas';
import AddEmpresas from './sub/AddEmpresas';
import swal from 'sweetalert';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Grid, LinearProgress } from '@material-ui/core';
import { Delete } from '@material-ui/icons';

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

const UserEdit = (props) => {
    const [empresaP, setEmpresaP] = useState({ id: 0, nombre: "" });
    const [presupuestos, setPresupuestos] = useState([]);
    const [presupuestosP, setP] = useState(null);
    const [proyectosP, setPro] = useState(null);
    const [centros, setC] = useState(null);
    const [presupuesto, setPresupuesto] = useState(null);
    const [proyecto, setProyecto] = useState(null);
    const [centro_c1, setCentroC1] = useState(null);
    const [centro_c2, setCentroC2] = useState(null);
    const [centro_c3, setCentroC3] = useState(null);
    const [centro_c4, setCentroC4] = useState(null);
    const [centro_c5, setCentroC5] = useState(null);
    const [empresas, setEmpresas] = useState([]);
    const [supervisor, setSupervisor] = useState(null);
    const [roles, setRoles] = useState(null);
    const [id, setId] = useState(-1);
    const [loading, setLoading] = useState(false);

    const handleChangeSelect = (option, b) => {
        if (b.name === "supervisor") {
            setSupervisor(option);
        }
        if (b.name === "roles") {
            setRoles(option);
        }
        if (b.name === "presupuesto") {
            setPresupuesto(option);
            setProyecto(null);
            setCentroC1(null);
            setCentroC2(null);
            setCentroC3(null);
            setCentroC4(null);
            setCentroC5(null);
        }
        if (b.name === "centro_c1") {
            setCentroC1(option);
        }
        if (b.name === "centro_c2") {
            setCentroC2(option);
        }
        if (b.name === "centro_c3") {
            setCentroC3(option);
        }
        if (b.name === "centro_c4") {
            setCentroC4(option);
        }
        if (b.name === "centro_c5") {
            setCentroC5(option);
        }
        if (b.name === "proyecto") {
            setProyecto(option);
        }
    }

    const savePresupuesto = () => {
        if (
            presupuesto === null
            // presupuesto === null ||
            // proyecto === null ||
            // centro_c1 === null ||
            // centro_c2 === null ||
            // centro_c3 === null ||
            // centro_c4 === null ||
            // centro_c5 === null
        ) {
            swal("Error", "¡Debe de seleccionar el presupuesto!", "error");
        } else {
            let presups = [...presupuestos];
            for (let i = 0; i < presups.length; i++) {
                if (presupuesto.value === presups[i].presupuesto) {
                    swal("Error", "¡Este presupuesto ya fue agregado!", "error");
                    return;
                }
            }
            let pres = {
                'presupuesto': presupuesto.value,
                'presupuesto_label': presupuesto.label,
                'proyecto': proyecto ? proyecto.value : 0,
                'proyecto_label': proyecto ? proyecto.label : "",
                'centro_c1': centro_c1 ? centro_c1.value : 0,
                'centro_c1_label': centro_c1 ? centro_c1.label : "",
                'centro_c2': centro_c2 ? centro_c2.value : 0,
                'centro_c2_label': centro_c2 ? centro_c2.label : "",
                'centro_c3': centro_c3 ? centro_c3.value : 0,
                'centro_c3_label': centro_c3 ? centro_c3.label : "",
                'centro_c4': centro_c4 ? centro_c4.value : 0,
                'centro_c4_label': centro_c4 ? centro_c4.label : "",
                'centro_c5': centro_c5 ? centro_c5.value : 0,
                'centro_c5_label': centro_c5 ? centro_c5.label : "",
            };
            presups.push(pres);
            setPresupuestos(presups);
            setPresupuesto(null);
            setProyecto(null);
            setCentroC1(null);
            setCentroC2(null);
            setCentroC3(null);
            setCentroC4(null);
            setCentroC5(null);
        }
    }

    const submitPresupuesto = () => {
        let data = {
            'usuario': id,
            'empresa': empresaP.idEmpresa,
            'presupuestos': presupuestos
        }
        setLoading(true);
        axios({
            method: 'post',
            url: props.url + 'users/save-presupuesto-empresa/',
            data,
            responseType: "json",
            headers: { "Content-Type": "application/json" }
        })
            .then(function (resp) {
                swal("Éxito", resp.data.texto, "success");
                setLoading(false);
            })
            .catch(function (err) {
                console.log(err);
                swal("Error", err.response.data.msg, "error");
                setLoading(false);
            });
    }

    const removePresupuesto = (idx) => {
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
                        let e = [...presupuestos];
                        e.splice(idx, 1);
                        setPresupuestos(e);
                    }
                });
        }
    }

    const classes = useStyles();
    // Pass the useFormik() hook initial form values and a submit function that will
    // be called when the form is submitted
    const formik = useFormik({
        initialValues: {
            email: '',
            nombre: '',
            password: ''
        },
        onSubmit: values => {
            if (
                values.nombre === ''
            ) {
                swal("Error", "¡El nombre es obligatorio!", "error");
                return false;
            }
            if (
                values.email === ''
            ) {
                swal("Error", "¡El email es obligatorio!", "error");
                return false;
            }
            if (
                typeof props.match.params.id === "undefined" &&
                values.password === ""
            ) {
                swal("Error", "¡Debe de ingresar la contraseña!", "error");
                return false;
            }
            if (
                supervisor === null
            ) {
                swal("Error", "¡El supervisor es obligatorio!", "error");
                return false;
            }
            if (
                roles === null
            ) {
                swal("Error", "¡El rol es obligatorio!", "error");
                return false;
            }

            values.user_id = id;
            values.empresas = empresas;
            values.supervisor = supervisor;
            if (roles.length > 0) {
                values.roles = roles;
            } else {
                values.roles = [roles];
            }
            let data = JSON.stringify(values);

            setLoading(true);
            if (id === -1) {
                axios({
                    method: 'post',
                    url: props.url + 'users',
                    data,
                    responseType: "json",
                    headers: { "Content-Type": "application/json" }
                })
                    .then(function (resp) {
                        swal("Éxito", resp.data.msg, "success");
                        props.loadUsers();
                        props.history.push(`/usuarios`);
                    })
                    .catch(function (err) {
                        console.log(err);
                        swal("Error", err.response.data.msg, "error");
                        setLoading(false);
                    });
            } else {
                axios({
                    method: 'put',
                    url: props.url + 'users/' + id,
                    data,
                    responseType: "json",
                    headers: { "Content-Type": "application/json" }
                })
                    .then(function (resp) {
                        swal("Éxito", resp.data.msg, "success");
                        props.loadUsers();
                        props.history.push(`/usuarios`);
                    })
                    .catch(function (err) {
                        console.log(err);
                        swal("Error", err.response.data.msg, "error");
                        setLoading(false);
                    });
            }
        },
    });

    const managePresupuestos = (idEmpresa, nombre) => {
        setEmpresaP({ idEmpresa, nombre });

        setPresupuesto(null);
        setProyecto(null);
        setCentroC1(null);
        setCentroC2(null);
        setCentroC3(null);
        setCentroC4(null);
        setCentroC5(null);
        // Get Presupuestos
        axios({
            method: 'post',
            url: props.url + 'get-presupuesto-empresa/',
            data: {
                empresa: idEmpresa,
                usuario: id
            },
            responseType: "json",
            headers: { "Content-Type": "application/json" }
        })
            .then(function (resp) {
                setPresupuestos(resp.data);
            })
            .catch(function (err) {
                console.log(err);
                if (err.response)
                    swal("Error", err.response.data.msg, "error");
            });
        // Get Proyectos
        axios({
            method: 'get',
            url: props.url + 'sap/proyectos/' + idEmpresa,
            responseType: "json",
            headers: { "Content-Type": "application/json" }
        })
            .then(function (resp) {
                setPro(resp.data);
            })
            .catch(function (err) {
                console.log(err);
                if (err.response)
                    swal("Error", err.response.data.msg, "error");
            });
        // Get presupuestos
        axios({
            method: 'get',
            url: props.url + 'presupuestos-empresa/' + idEmpresa,
            responseType: "json",
            headers: { "Content-Type": "application/json" }
        })
            .then(function (resp) {
                setP(resp.data);
            })
            .catch(function (err) {
                console.log(err);
                if (err.response)
                    swal("Error", err.response.data.msg, "error");
            });
        // Get Centro Costo
        axios({
            method: 'get',
            url: props.url + 'sap/centros-costo/' + idEmpresa,
            responseType: "json",
            headers: { "Content-Type": "application/json" }
        })
            .then(function (resp) {
                setC(resp.data);
            })
            .catch(function (err) {
                console.log(err);
                if (err.response)
                    swal("Error", err.response.data.msg, "error");
            });
    }

    useEffect(() => {
        if (typeof props.match.params.id !== "undefined") {
            setId(props.match.params.id);
            axios({
                method: 'get',
                url: props.url + 'users/' + props.match.params.id,
                responseType: "json",
                headers: { "Content-Type": "application/json" }
            })
                .then(function (resp) {
                    formik.setFieldValue('nombre', resp.data.nombre, false);
                    formik.setFieldValue('email', resp.data.email, false);
                    setEmpresas(resp.data.empresas);
                    setSupervisor(
                        {
                            "value": resp.data.supervisor,
                            "label": resp.data.nombre_supervisor
                        }
                    );
                    setRoles(resp.data.roles);

                    // swal("Atención", resp.data.msg, "success");
                })
                .catch(function (err) {
                    console.log(err);
                    if (err.response)
                        swal("Error", err.response.data.msg, "error");
                });
        }
    }, [])

    const removeEmpresa = (idx) => {
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
                        let e = [...empresas];
                        e.splice(idx, 1);
                        setEmpresas(e);
                    }
                });
        }
    }

    return (
        <div className="main-container">
            <Typography variant="h3" component="h1" gutterBottom>
                <Link className="link" to="/usuarios">
                    <ArrowBackIosIcon />
                </Link>
                {
                    typeof props.match.params.id !== "undefined" ? "Editar Usuario" : "Crear usuario"
                }
            </Typography>
            <div className="user-container">
                <div className="left">
                    <form onSubmit={formik.handleSubmit}>
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
                                id="email"
                                name="email"
                                label="Email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                fullWidth
                                id="password"
                                name="password"
                                label="Contraseña"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <FormControl variant="outlined" className="form-item">
                                <label className="manual" htmlFor="supervisor">
                                    Supervisor
                                </label>
                                <Select2
                                    isSearchable={true}
                                    onChange={handleChangeSelect}
                                    value={supervisor}
                                    name="supervisor"
                                    id="supervisor"
                                    options={props.users}
                                    placeholder="*Selecciones supervisor"
                                />
                            </FormControl>
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <FormControl variant="outlined" className="form-item">
                                <label className="manual" htmlFor="roles">
                                    Rol
                                </label>
                                <Select2
                                    isSearchable={true}
                                    onChange={handleChangeSelect}
                                    value={roles}
                                    name="roles"
                                    id="roles"
                                    options={props.roles}
                                    placeholder="*Seleccione sus roles"
                                />
                            </FormControl>
                        </FormControl>
                    </form>

                </div>

                <div className="right">

                    <AddEmpresas
                        setEmpresas={setEmpresas}
                        data={empresas}
                        ListadoEmpresas={props.ListadoEmpresas}
                        proveedoresSAP={props.proveedoresSAP}
                        usuariosSAP={props.usuariosSAP}
                        loadSAP={props.loadSAP}
                        cargandoSAP={props.cargandoSAP}
                    />

                    <TableUsuariosEmpresas
                        data={empresas}
                        removeEmpresa={removeEmpresa}
                        managePresupuestos={managePresupuestos}
                        usuario={id}
                    />
                </div>
                {
                    empresaP.id !== 0 ?
                        (

                            <div className="full">
                                <div className="presupuestos">
                                    <Typography variant="h4" component="h6" gutterBottom>
                                        Presupuesto empresa {empresaP.nombre}
                                    </Typography>
                                    <div className="add-presupuestos">
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} lg={3} md={3} sm={6}>
                                                <FormControl variant="outlined" className="form-item">
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={presupuesto}
                                                        name="presupuesto"
                                                        id="presupuesto"
                                                        options={presupuestosP ? presupuestosP : {}}
                                                        placeholder="* Presupuesto"
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} lg={3} md={3} sm={6}>
                                                <FormControl variant="outlined" className="form-item">
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={proyecto}
                                                        name="proyecto"
                                                        id="proyecto"
                                                        options={proyectosP ? proyectosP : {}}
                                                        placeholder="Proyecto"
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} lg={3} md={3} sm={6}>
                                                <FormControl variant="outlined" className="form-item">
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={centro_c1}
                                                        name="centro_c1"
                                                        id="centro_c1"
                                                        options={centros && centros.length > 0 ? centros[0] : {}}
                                                        placeholder="Centro Costo 1"
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} lg={3} md={3} sm={6}>
                                                <FormControl variant="outlined" className="form-item">
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={centro_c2}
                                                        name="centro_c2"
                                                        id="centro_c2"
                                                        options={centros && centros.length > 1 ? centros[1] : {}}
                                                        placeholder="Centro Costo 2"
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} lg={3} md={3} sm={6}>
                                                <FormControl variant="outlined" className="form-item">
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={centro_c3}
                                                        name="centro_c3"
                                                        id="centro_c3"
                                                        options={centros && centros.length > 2 ? centros[2] : {}}
                                                        placeholder="Centro Costo 3"
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} lg={3} md={3} sm={6}>
                                                <FormControl variant="outlined" className="form-item">
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={centro_c4}
                                                        name="centro_c4"
                                                        id="centro_c4"
                                                        options={centros && centros.length > 3 ? centros[3] : {}}
                                                        placeholder="Centro Costo 4"
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} lg={3} md={3} sm={6}>
                                                <FormControl variant="outlined" className="form-item">
                                                    <Select2
                                                        isSearchable={true}
                                                        onChange={handleChangeSelect}
                                                        value={centro_c5}
                                                        name="centro_c5"
                                                        id="centro_c5"
                                                        options={centros && centros.length > 4 ? centros[4] : {}}
                                                        placeholder="Centro Costo 5"
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} lg={3} md={3} sm={12}>
                                                <Button
                                                    color="primary"
                                                    variant="contained"
                                                    fullWidth
                                                    onClick={savePresupuesto}
                                                    disabled={loading}
                                                >
                                                    Agregar
                                                </Button>
                                                {
                                                    loading ?
                                                        (
                                                            <LinearProgress color="secondary" />
                                                        ) : ""
                                                }
                                            </Grid>
                                        </Grid>
                                    </div>
                                    <div className="table-container">
                                        <table className="detail-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Presupuesto
                                                    </th>
                                                    <th>
                                                        Proyecto
                                                    </th>
                                                    <th>
                                                        Centro Costo 1
                                                    </th>
                                                    <th>
                                                        Centro Costo 2
                                                    </th>
                                                    <th>
                                                        Centro Costo 3
                                                    </th>
                                                    <th>
                                                        Centro Costo 4
                                                    </th>
                                                    <th>
                                                        Centro Costo 5
                                                    </th>
                                                    <th>
                                                        Acciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            {presupuestos && presupuestos.length > 0
                                                ?
                                                (
                                                    <tbody>
                                                        {
                                                            presupuestos.map((key, idx) => (
                                                                <tr key={idx}>
                                                                    <td>
                                                                        {key.presupuesto_label}
                                                                    </td>
                                                                    <td>
                                                                        {key.proyecto_label}
                                                                    </td>
                                                                    <td>
                                                                        {key.centro_c1_label}
                                                                    </td>
                                                                    <td>
                                                                        {key.centro_c2_label}
                                                                    </td>
                                                                    <td>
                                                                        {key.centro_c3_label}
                                                                    </td>
                                                                    <td>
                                                                        {key.centro_c4_label}
                                                                    </td>
                                                                    <td>
                                                                        {key.centro_c5_label}
                                                                    </td>
                                                                    <td>
                                                                        <Button
                                                                            color="secondary"
                                                                            variant="contained"
                                                                            type="button"
                                                                            onClick={() => removePresupuesto(idx)}
                                                                        >
                                                                            <Delete />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                ) :
                                                (
                                                    <tbody></tbody>
                                                )
                                            }
                                        </table>
                                    </div>
                                    <Button
                                        color="secondary"
                                        variant="contained"
                                        className="full-button"
                                        fullWidth
                                        type="button"
                                        onClick={submitPresupuesto}
                                        disabled={loading}
                                    >
                                        Guardar presupuesto
                                    </Button>
                                    {
                                        loading ?
                                            (
                                                <LinearProgress color="secondary" />
                                            ) : ""
                                    }
                                </div>
                            </div>
                        ) : ""
                }
                <Button
                    color="primary"
                    variant="contained"
                    className="full-button"
                    fullWidth
                    type="button"
                    onClick={() => formik.submitForm()}
                    disabled={loading}
                >
                    Guardar Usuario
                </Button>
                {
                    loading ?
                        (
                            <LinearProgress color="secondary" style={{ width: "100%", marginTop: "10px" }} />
                        ) : ""
                }
            </div>
        </div>
    );
};
export default UserEdit;
