import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Select2 from 'react-select';
import swal from 'sweetalert';

const AddEmpresas = (props) => {
    const [empresa, setEmpresa] = useState(null);
    const [proveedor, setProveedor] = useState(null);
    const [usuario, setUsuario] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();

        if(
            empresa === null ||
            proveedor === null ||
            usuario === null
        ){
            swal("Error", "¡Debes de llenar todos los campos!", "error");
        }else{
            let es = [...props.data];

            es.push({
                'au_empresa_id' : empresa.value,
                'nombre_empresa' : empresa.label,
                'codigo_proveedor_sap' : proveedor.value,
                'nombre_proveedor_sap' : proveedor.label,
                'codigo_usuario_sap' : usuario.value,
                'nombre_usuario_sap' : usuario.label
            });

            props.setEmpresas(es);

            setEmpresa(null);
            setProveedor(null);
            setUsuario(null);
        }

        return false;
    }
    const handleChangeSelect = (option, b) => {
        if (b.name === "empresa") {
            setEmpresa(option);
        }
        if (b.name === "proveedor") {
            setProveedor(option);
        }
        if (b.name === "usuario") {
            setUsuario(option);
        }
    }

    return (
        <div className="add-empresa">
            <Typography variant="h4" component="h6" gutterBottom>
                Agregar Empresa
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} lg={3} md={3} sm={6}>
                        <FormControl variant="outlined" className="form-item">
                            <Select2
                                isSearchable={true}
                                onChange={handleChangeSelect}
                                value={empresa}
                                name="empresa"
                                id="empresa"
                                options={props.ListadoEmpresas}
                                placeholder="*Empresa"
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} lg={3} md={3} sm={6}>
                        <FormControl variant="outlined" className="form-item">
                            <Select2
                                isSearchable={true}
                                onChange={handleChangeSelect}
                                value={proveedor}
                                name="proveedor"
                                id="proveedor"
                                options={props.proveedoresSAP}
                                placeholder="*Proveedor"
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} lg={3} md={3} sm={6}>
                        <FormControl variant="outlined" className="form-item">
                            <Select2
                                isSearchable={true}
                                onChange={handleChangeSelect}
                                value={usuario}
                                name="usuario"
                                id="usuario"
                                options={props.usuariosSAP}
                                placeholder="*Usuario"
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} lg={3} md={3} sm={6}>
                        <Button color="primary" variant="contained" fullWidth type="submit">
                            Agregar
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
}
export default AddEmpresas;