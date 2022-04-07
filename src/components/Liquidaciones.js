import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import MaterialTable from 'material-table';
import { Link } from "react-router-dom";
import {
    Edit,
    Delete,
    Check,
    Warning
} from '@material-ui/icons/';
import swal from 'sweetalert';
import axios from 'axios';
import tableIcons from './sub/tableIcons';

class Liquidaciones extends Component {

    constructor(props) {
        super(props);
        this.state = {
            columns: [
                { title: 'ID', field: 'value' },
                { title: 'Estado', field: 'estado' },
                { title: 'Usuario', field: 'usuario' },
                { title: 'Fecha Inicio', field: 'label' },
                { title: 'Fecha Fin', field: 'fecha_fin' },
                {

                    title: 'Total Facturado',
                    field: 'total_facturado',
                    render: rowData => parseFloat(rowData.total_facturado).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })
                },
                {
                    title: 'No Aplica',
                    field: 'no_aplica',
                    render: rowData => parseFloat(rowData.no_aplica).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })
                },
                {
                    title: 'Reembolso',
                    field: 'reembolso',
                    render: rowData => parseFloat(rowData.reembolso).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })
                },
            ]
        };
    }

    render() {

        let data = null;

        if (this.props.data) data = this.props.data;

        return (
            <div className="main-container">
                <Typography variant="h3" component="h1" gutterBottom>
                    Liquidaciones
                    <Link className="new-btn" to="/edit-liquidacion">
                        Nueva Liquidación
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
                                        icon: () => <Warning color="secondary" />,
                                        tooltip: 'Error en el presupuesto asignado',
                                        hidden: !(rowData.empresa_id === null || rowData.gasto_id === null)
                                    }),
                                    rowData => ({
                                        icon: Edit,
                                        tooltip: 'Editar Liquidación',
                                        hidden: !((rowData.au_estado_liquidacion_id === "0" || rowData.au_estado_liquidacion_id === "2" || rowData.au_estado_liquidacion_id === "4") && (rowData.empresa_id !== null && rowData.gasto_id !== null)),
                                        onClick: (event, rowData) => {
                                            // console.log(rowData.empresa_id !== null && rowData.gasto_id !== null);
                                            this.props.history.push("/edit-liquidacion/" + rowData.value);
                                        },
                                    }),
                                    rowData => ({
                                        icon: Check,
                                        tooltip: 'Aprobar Liquidación',
                                        hidden: (rowData.au_estado_liquidacion_id === "0" || rowData.au_estado_liquidacion_id === "2" || rowData.au_estado_liquidacion_id === "4" || rowData.empresa_id === null || rowData.gasto_id === null),
                                        onClick: (event, rowData) => {
                                            this.props.history.push("/edit-liquidacion/" + rowData.value);
                                        },
                                    }),
                                    rowData => ({
                                        icon: Delete,
                                        tooltip: 'Eliminar Liquidación',
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
                                                            url: this.props.url + 'liquidacion/' + rowData.value,
                                                            responseType: "json",
                                                            headers: { "Content-Type": "application/json" }
                                                        })
                                                            .then(function (resp) {
                                                                swal("Atención", resp.data.msg, "success");
                                                                t.props.loadBancos();
                                                            })
                                                            .catch(function (err) {
                                                                console.log(err);
                                                                if (err.response && err.response.data)
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
export default Liquidaciones;