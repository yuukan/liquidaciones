import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import MaterialTable from 'material-table';
import { Link } from "react-router-dom";

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
import { CalendarToday, Money, Cancel, Schedule, FiberNew, Visibility, Star,Gavel } from '@material-ui/icons/';

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

class List extends Component {

    constructor(props) {
        super(props);
        this.state = {
            columns: [
                { title: 'ID', field: 'id' },
                { title: 'Vendedor', field: 'nombre_vendedor' },
                { 
                    title: 'Fecha carga', 
                    field: 'FechaCarga',
                    customSort: (a, b) => {
                        a = a.FechaCarga.split("/");
                        b = b.FechaCarga.split("/");
                        var d1 = a[2]+a[1]+a[0];
                        var d2 = b[2]+b[1]+b[0];
                        return parseInt(d1) - parseInt(d2);
                    }
                },
                { title: 'Hora Carga', field: 'HoraCarga' },
                { title: 'Cliente', field: 'CodigoCliente' },
                { title: 'Status', field: 'status' },
                { title: 'Tipo Pago', field: 'tipo_pago' },
                { title: 'Código Transporte', field: 'NumeroUnidad' },
            ]
        };
    }

    render() {

        let orders = null;

        if (this.props.orders) orders = this.props.orders;

        let v = parseInt(localStorage.getItem("tp_vendedor"));
        if (orders)
            orders = orders.filter(
                (key) =>
                    key.sid !== "5" && key.sid !== "6" && ( !v || v===0 || ( v>0 && parseInt(key.vendedor)===v ) )
            );

        return (
            <div className="main-container">
                <Typography variant="h3" component="h1" gutterBottom>
                    Listado de Pedidos
                    {
                        this.props.user_permissions.includes("1") ?
                            (
                                <Link className="new-btn" to="/nueva-orden">
                                    Nueva Orden
                                </Link>
                            ) : ""
                    }
                </Typography>
                <div className="landing-container with-spacing">
                    {
                        orders ? (
                            <MaterialTable
                                icons={tableIcons}
                                columns={this.state.columns}
                                data={orders}
                                title="Horario Asignado"
                                options={{
                                    pageSize: 20
                                }}
                                actions={[
                                    rowData => ({
                                        icon: () => <Star color="secondary" />,
                                        tooltip: 'VIP',
                                        hidden: rowData.star === 'N'
                                    }),
                                    rowData => ({
                                        icon: FiberNew,
                                        tooltip: 'Nuevo',
                                        hidden: rowData.sid !== '1'
                                    }),
                                    rowData => ({
                                        icon: CalendarToday,
                                        tooltip: 'Horario Asignado',
                                        hidden: rowData.HorarioAsignado === null
                                    }),
                                    rowData => ({
                                        icon: Money,
                                        tooltip: 'Credito Validado',
                                        hidden: rowData.CreditoValidado === null
                                    }),
                                    rowData => ({
                                        icon: Gavel,
                                        tooltip: 'Necesita aprobación contra Boleta',
                                        hidden: rowData.contra_boleta !== "2"
                                    }),
                                    rowData => ({
                                        icon: Cancel,
                                        tooltip: 'Anulada',
                                        hidden: rowData.status !== "Anulado"
                                    }),
                                    rowData => ({
                                        icon: Schedule,
                                        tooltip: 'Programada',
                                        hidden: rowData.Programado === null
                                    }),
                                    rowData => ({
                                        icon: Visibility,
                                        tooltip: 'Ver Detalles',
                                        onClick: (event, rowData) => {
                                            this.props.history.push("/detail/" + rowData.id);
                                        },
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
                                        actions: 'Estados'
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
export default List;