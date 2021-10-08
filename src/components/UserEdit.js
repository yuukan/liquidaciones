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
    const [empresas, setEmpresas] = useState([]);
    const [supervisor, setSupervisor] = useState(null);
    const [roles, setRoles] = useState(null);
    const [presupuestos, setPresupuestos] = useState(null);
    const [id, setId] = useState(-1);

    const handleChangeSelect = (option, b) => {
        if (b.name === "supervisor") {
            setSupervisor(option);
        }
        if (b.name === "roles") {
            setRoles(option);
        }
        if (b.name === "presupuestos") {
            setPresupuestos(option);
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
            values.user_id = id;
            values.empresas = empresas;
            values.supervisor = supervisor;
            values.roles = roles;
            values.presupuestos = presupuestos;
            let data = JSON.stringify(values);

            if (
                typeof props.match.params.id === "undefined" &&
                values.password === ""
            ) {
                swal("Error", "¡Debe de ingresar la contraseña!", "error");
            }

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
                    });
            }
        },
    });

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

                    setPresupuestos(resp.data.presupuestos);
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
                                    Roles
                                </label>
                                <Select2
                                    isSearchable={true}
                                    onChange={handleChangeSelect}
                                    value={roles}
                                    name="roles"
                                    id="roles"
                                    isMulti
                                    options={props.roles}
                                    placeholder="*Seleccione sus roles"
                                />
                            </FormControl>
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <FormControl variant="outlined" className="form-item">
                                <label className="manual" htmlFor="roles">
                                    Presupuestos
                                </label>
                                <Select2
                                    isSearchable={true}
                                    onChange={handleChangeSelect}
                                    value={presupuestos}
                                    name="presupuestos"
                                    id="presupuestos"
                                    isMulti
                                    options={props.presupuestos}
                                    placeholder="*Seleccione sus presupuestos"
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
                    />

                    <TableUsuariosEmpresas
                        data={empresas}
                        removeEmpresa={removeEmpresa}
                    />
                </div>
                <Button color="primary" variant="contained" className="full-button" fullWidth type="button" onClick={() => formik.submitForm()}>
                    Guardar Usuario
                </Button>
            </div>
        </div>
    );
};
export default UserEdit;
