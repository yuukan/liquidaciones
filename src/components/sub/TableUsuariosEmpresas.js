import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { Delete } from '@material-ui/icons/';

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
                                                <Button
                                                    color="secondary"
                                                    variant="contained"
                                                    fullWidth
                                                    type="button"
                                                    className="horizontal-btn-fix"
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
                        : ""}
                </table>
            </div>
        );
    }
}
export default TableUsuariosEmpresas;