import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import MaterialTable from 'material-table';
import LinearProgress from '@material-ui/core/LinearProgress';
import Select2 from 'react-select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
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

class ReporteVendedores extends Component {

    constructor() {
        super();
        this.handleChangeSelect = this.handleChangeSelect.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.generarReporte = this.generarReporte.bind(this);
        this.state = {
            vendedor: null,
            fechaInicio: new Date(),
            fechaFin: new Date(),
            plant: null,
            disabled: false,
            columns: [
                { title: 'Planta', field: 'nombre' },
                { title: 'Vendedor', field: 'nombre_vendedor' },
                { title: 'Producto', field: 'Producto' },
                { title: 'Cantidad', field: 'cantidad', render: rowData => this.numFormat(parseFloat(rowData.cantidad)) },
            ],
            data: null
        }
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleDateChange(fechaInicio) {
        this.setState({ fechaInicio });
    }
    handleDateChange2(fechaFin) {
        this.setState({ fechaFin });
    }

    numFormat(num) {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    generarReporte() {
        let t = this;
        this.setState({disabled:true});
        axios.post(this.props.url + "api/generate-report", {
            vendedor: t.state.vendedor,
            planta: t.state.plant,
            inicio: t.state.fechaInicio,
            fin: t.state.fechaFin
        })
            .then(function (response) {
                t.setState({data:response.data,disabled:false});
            })
            .catch(function (error) {
                console.log(error);
            });
    }
    
    //############################################################
    handleChangeSelect(option, b) {
        this.setState({ [b.name]: option });
    }
    render() {

        return (
            <div className="main-container">
                <Typography variant="h3" component="h1" gutterBottom>
                    Reporte de Vendedores
                </Typography>
                <div className="landing-container">
                    <Grid container spacing={2} justify="space-around">
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <FormControl variant="outlined" className="form-item margin-fix2 z-fix">
                                <Select2
                                    value={this.state.vendedor}
                                    isSearchable={true}
                                    isClearable={true}
                                    onChange={this.handleChangeSelect}
                                    name="vendedor"
                                    options={this.props.vendedores}
                                    placeholder="Vendedor"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <FormControl variant="outlined" className="form-item margin-fix2 z-fix">
                                <Select2
                                    value={this.state.plant}
                                    isSearchable={true}
                                    onChange={this.handleChangeSelect}
                                    name="plant"
                                    options={this.props.plants}
                                    placeholder="*Seleccione Planta"
                                    isClearable={true}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2} lg={2}>
                            <div className="date-picker z-fix">
                                <DatePicker
                                    selected={this.state.fechaInicio}
                                    onChange={date => this.handleDateChange(date)}
                                    selectsStart
                                    startDate={this.state.fechaInicio}
                                    endDate={this.state.fechaFin}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2} lg={2}>
                            <div className="date-picker z-fix">
                                <DatePicker
                                    selected={this.state.fechaFin}
                                    onChange={date => this.handleDateChange2(date)}
                                    selectsEnd
                                    startDate={this.state.fechaInicio}
                                    endDate={this.state.fechaFin}
                                    minDate={this.state.fechaInicio}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2} lg={2}>
                            <Button
                                variant="contained" 
                                color="primary" 
                                disabled={this.state.disabled} 
                                className="save-btn pull-right margin-fix2" 
                                onClick={this.generarReporte}
                            >
                                Generar Reporte
                            </Button>
                            {
                                this.state.disabled ?
                                (
                                    <div className="progress">
                                        <LinearProgress /> 
                                    </div>
                                ): ""
                            }
                        </Grid>
                    </Grid>
                </div>
                <div className="landing-container with-spacing">
                    {
                        this.state.data ? (
                            <MaterialTable
                                icons={tableIcons}
                                columns={this.state.columns}
                                data={this.state.data}
                                title="Reporte Vendedores"
                                options={{
                                    pageSize: 50
                                }}
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
                                        emptyDataSourceMessage: 'No existen ventas',
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
export default ReporteVendedores;