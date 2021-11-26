import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import {
    Delete,
    MoneySharp
} from '@material-ui/icons/';
import { IconButton, Tooltip } from '@material-ui/core';

class TableUsuariosEmpresas extends Component {

    render() {

        let data = null;

        if (this.props.data) data = this.props.data;

        return (
            <div className="table-container">
                <table className="detail-table">
                    <thead>
                        <tr>
                            <th>
                                Empresa
                            </th>
                            <th>
                                Código Proveedor SAP
                            </th>
                            <th>
                                Código Usuario SAP
                            </th>
                            <th>
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    {data && data.length > 0
                        ?
                        (
                            <tbody>
                                {
                                    data.map((key, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                {key.nombre_empresa}
                                            </td>
                                            <td>
                                                {key.nombre_proveedor_sap}
                                            </td>
                                            <td>
                                                {key.nombre_usuario_sap}
                                            </td>
                                            <td>
                                                {
                                                    this.props.usuario !== -1 ?
                                                        (
                                                            <Tooltip title="Presupuestos">
                                                                <IconButton
                                                                    aria-label="Presupuestos"
                                                                    onClick={() => this.props.managePresupuestos(key.au_empresa_id, key.nombre_empresa)}
                                                                >
                                                                    <MoneySharp />
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : ""
                                                }
                                                <Button
                                                    color="secondary"
                                                    variant="contained"
                                                    type="button"
                                                    onClick={() => this.props.removeEmpresa(idx)}
                                                >
                                                    <Delete />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        )
                        : 
                        (
                            <tbody></tbody>
                        )
                    }
                </table>
            </div>
        );
    }
}
export default TableUsuariosEmpresas;