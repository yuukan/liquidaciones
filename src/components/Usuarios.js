import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import MaterialTable from 'material-table';
import { Link } from "react-router-dom";
import { Edit, Delete } from '@material-ui/icons/';
import swal from 'sweetalert';
import axios from 'axios';
import tableIcons from './sub/tableIcons';
import Cookies from 'js-cookie';

class Usuarios extends Component {

    constructor(props) {
        super(props);
        this.state = {
            columns: [
                { title: 'ID', field: 'value' },
                { title: 'Nombre', field: 'label' },
                { title: 'Email', field: 'email' }
            ]
        };
    }

    render() {

        let data = null;

        if (this.props.data) data = this.props.data;

        return (
            <div className="main-container">
                <Typography variant="h3" component="h1" gutterBottom>
                    Usuarios
                    <Link className="new-btn" to="/edit-user">
                        Nuevo Usuario
                    </Link>
                </Typography>
                <div className="landing-container">
                    {
                        data ? (
                            <MaterialTable
                                icons={tableIcons}
                                columns={this.state.columns}
                                data={data}
                                title=""
                                options={{
                                    pageSize: 20
                                }}
                                actions={[
                                    rowData => ({
                                        icon: Edit,
                                        tooltip: 'Editar Usuario',
                                        onClick: (event, rowData) => {
                                            this.props.history.push("/edit-user/" + rowData.value);
                                        },
                                    }),
                                    rowData => ({
                                        icon: Delete,
                                        tooltip: 'Eliminar Usuario',
                                        hidden: rowData.value === Cookies.get('lu_id'),
                                        onClick: (event, rowData) => {
                                            let t = this;
                                            swal({
                                                title: "¿Esta seguro?",
                                                text: "¡Esta operación no se puede revertir!",
                                                icon: "warning",
                                                buttons: true,
                                                dangerMode: true,
                                            })
                                                .then((willDelete) => {
                                                    if (willDelete) {
                                                        axios({
                                                            method: 'delete',
                                                            url: this.props.url + 'users/' + rowData.value,
                                                            responseType: "json",
                                                            headers: { "Content-Type": "application/json" }
                                                        })
                                                            .then(function (resp) {
                                                                swal("Atención", resp.data.msg, "success");
                                                                t.props.loadUsers();
                                                            })
                                                            .catch(function (err) {
                                                                console.log(err);
                                                                if (err.response)
                                                                    swal("Error", err.response.data.msg, "error");
                                                            });
                                                    }
                                                });
                                        },
                                    }),
                                ]}
                                localization={{
                                    pagination: {
                                        labelDisplayedRows: '{from}-{to} de {count}',
                                        labelRowsSelect: 'Filas'
                                    },
                                    toolbar: {
                                        nRowsSelected: '{0} filas(s) seleccionadas',
                                        searchPlaceholder: 'Buscar'
                                    },
                                    header: {
                                        actions: 'Acciones'
                                    },
                                    body: {
                                        emptyDataSourceMessage: 'No existen resultados',
                                        filterRow: {
                                            filterTooltip: 'Filter'
                                        }
                                    }

                                }}
                            />
                        ) : ""
                    }
                </div>
            </div>
        );
    }
}
export default Usuarios;