import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import MaterialTable from 'material-table';
import { Schedule, Cancel, Star } from '@material-ui/icons/';
import swal from 'sweetalert';
import axios from 'axios';

import { forwardRef } from 'react';
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import {CheckBoxTwoTone, Gavel} from '@material-ui/icons';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

class Programar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            columns: [
                { title: 'ID', field: 'id', type: 'numeric',defaultSort: 'desc' },
                { title: 'Vendedor', field: 'nombre_vendedor' },
                { title: 'Fecha Carga', field: 'FechaCarga' },
                { title: 'Hora Carga', field: 'HoraCarga' },
                { title: 'Cliente', field: 'CodigoCliente' },
                { title: 'Ya Programado?', field: 'Programado' },
                { title: 'Status', field: 'status' },
                { title: 'Planta', field: 'NombrePlanta' },
                { title: 'Tipo Pago', field: 'tipo_pago' },
                { title: 'Costo Total', field: 'costo',render: rowData => "Q "+this.numFormat(parseFloat(rowData.costo)) },
                { title: 'Venta Total', field: 'venta',render: rowData => "Q "+this.numFormat(parseFloat(rowData.venta)) },
                { title: 'Código Transporte', field: 'NumeroUnidad' },
                { title: 'Detalle', field: 'detalle', render: rowData => <div dangerouslySetInnerHTML={{ __html: rowData.detalle }} /> },
            ]
        };
    }

    numFormat(num) {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    render() {

        let orders = null;

        if (this.props.orders) orders = this.props.orders;

        // Show only the anuladas orders
        let v = parseInt(localStorage.getItem("tp_vendedor"));
        if (orders)
            orders = orders.filter(
                (key) =>
                    // key.Programado!=="1"
                    key.sid !== "5" && key.sid !== "6" && ( !v || v===0 || ( v>0 && parseInt(key.vendedor)===v ) )
            );

        return (
            <div className="main-container">
                <Typography variant="h3" component="h1" gutterBottom>
                    Pedidos listos para programar
                </Typography>
                <div className="landing-container with-spacing">
                    {
                        orders ? (
                            <MaterialTable
                                icons={tableIcons}
                                columns={this.state.columns}
                                data={orders}
                                title="Listado de Pedidos"
                                options={{
                                    pageSize: 20,
                                    rowStyle: rowData => {
                                        if(rowData.Programado !== null) {
                                            return {color: '#3f51b5'}; 
                                        }
                                        
                                        // return {};
                                    }
                                }}
                                actions={[
                                    rowData => ({
                                        icon: () => <Star color="secondary" />,
                                        tooltip: 'VIP',
                                        hidden: rowData.star === 'N'
                                    }),
                                    rowData => ({
                                        icon: Gavel,
                                        tooltip: 'Necesita aprobación contra Boleta',
                                        hidden: rowData.contra_boleta !== "2"
                                    }),
                                    rowData => ({
                                        icon: () => <CheckBoxTwoTone color="primary" />,
                                        tooltip: 'Ya fue programado',
                                        hidden: rowData.Programado === null
                                    }),
                                    rowData => ({
                                        icon: Schedule,
                                        tooltip: 'Marcar como Programado',
                                        onClick: (event, rowData) => {

                                            let text = "¿Desea marcar como programada?";
                                            if(rowData.Programado!==null){
                                                text = "Esta orden ya fue marcada como programada, ¿desea volverlo a hacer?";
                                            }


                                            swal(text, "Comentario", {
                                                buttons: ["No", "Si"],
                                                icon: "warning",
                                                content: "input",
                                            }).then((subir) => {
                                                if (subir !== null) {
                                                    let t_ = this;
                                                    axios.post(this.props.url + "api/mark-programmed", {
                                                        id: rowData.id,
                                                        user: window.localStorage.getItem('tp_uid'),
                                                        comentario: subir
                                                    })
                                                        .then(function (response) {
                                                            if (response.data) {
                                                                t_.props.load_orders();
                                                                swal("Exito!", "Se marcó la orden como programada.", {
                                                                    icon: "success"
                                                                });
                                                            } else {
                                                                swal("Error", "Contactar al Administrador", {
                                                                    icon: "error"
                                                                });
                                                            }
                                                        })
                                                        .catch(function (error) {
                                                            console.log(error);
                                                        });
                                                }
                                                // console.log(rowData);
                                            });
                                            // this.props.history.push("/creditos/" + rowData.id);
                                        },
                                        hidden: parseInt(rowData.oid) === 6
                                    }),
                                    rowData => ({
                                        icon: Cancel,
                                        tooltip: 'Anular Orden',
                                        onClick: (event, rowData) => {
                                            // this.props.history.push("/creditos/" + rowData.id);
                                            swal("Anular Orden?", "Comentario", {
                                                buttons: ["No", "Si"],
                                                icon: "warning",
                                                content: "input",
                                            }).then((anular) => {
                                                if (anular !== null) {
                                                    let t_ = this;
                                                    axios.post(this.props.url + "api/cancel-order", {
                                                        id: rowData.id,
                                                        user: window.localStorage.getItem('tp_uid'),
                                                        comentario: anular
                                                    })
                                                        .then(function () {
                                                            // t.setState({ clientes: response.data });
                                                            t_.props.load_orders();
                                                        })
                                                        .catch(function (error) {
                                                            console.log(error);
                                                        });
                                                }
                                            });
                                        }
                                    })

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
                                        emptyDataSourceMessage: 'No existen ordenes',
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
export default Programar;