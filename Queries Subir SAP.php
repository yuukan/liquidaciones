<?php 
//Encabezado Facturas de Liquidación
        $encabezado = collect(DB::select("
                            select                                 
                                DocNum		    =	a.ID, 
                                DocType		    =	'dDocument_Service',
                                DocDate		    =	case when k.AJUSTE_FINDEMES = 1 and day(a.FECHA_FACTURA) >= COALESCE(DIA_EFECTIVO, 0) then 
                                                        cast(cast(year(dateadd(month, 1, a.FECHA_FACTURA)) as varchar) 
                                                        + '-' 
                                                        + cast(month(dateadd(month, 1, a.FECHA_FACTURA)) as varchar) 
                                                        + '-01' as DATE)
                                                    else
                                                        a.FECHA_FACTURA
                                                    end, 
                                DocDueDate		=	a.FECHA_FACTURA, 
                                DocTaxDate		=	a.FECHA_FACTURA, 
                                CardCode        =	g.CODIGO_PROVEEDOR_SAP,
                                NumAtCard	    =	COALESCE(a.Serie,'') + ' - ' +  a.NUMERO,
                                DocCurrency     = RTRIM(a.MONEDA_ID),
                                SalesPersonCode = g.USERSAP_ID,
                                U_FacFecha      = a.FECHA_FACTURA,
                                U_FacSerie      = coalesce(a.SERIE, '') ,
                                U_FacNum        = a.NUMERO,
                                U_facNit        = j.IDENTIFICADOR_TRIBUTARIO ,
                                U_facNom        = j.NOMBRE,
                                U_Clase_LibroCV = ltrim(rtrim(c.GRUPOTIPOGASTO_ID)),
                                U_tipo_documento= ltrim(rtrim(i.id)),
                                businessObject  = 'oPurchaseInvoices',                                
                                Comentario      = Coalesce(a.Comentario_pago,''),
                                Foto            =  '{$path}' + f.email + '\' + a.Foto,
                                XML_File        =  case when a.XML_File = 'N/A' then
                                                        ''
                                                    else
                                                        '{$path}' + f.email + '\' + a.XML_File
                                                    end
                            from 
                                            liq_factura                 a 
                                inner join  cat_tipogasto               c   on  a.TIPOGASTO_ID  =   c.ID 
                                                                            and c.empresa_id    = {$empresa_id}  
                                inner join  cat_subcategoria_tipogasto  b   on  a.SUBCATEGORIA_TIPOGASTO_ID = b.ID 
                                inner join  liq_liquidacion             d   on  a.liquidacion_id = d.id 
                                inner join  cat_usuarioruta             e   on  d.USUARIORUTA_ID = e.ID 
                                inner join  users                       f   on  e.USER_ID = f.id 
                                inner join  cat_usuarioempresa          g   on  f.id = g.USER_ID
                                                                            and g.EMPRESA_ID = c.EMPRESA_ID 
                                inner join  cat_empresa                 k   on  g.Empresa_ID = k.ID 
                                inner join  cat_tipodocumento           i   on  a.TIPODOCUMENTO_ID = i.ID 
                                inner join  cat_proveedor               j   on  a.PROVEEDOR_ID = j.id
                            where 
                                a.LIQUIDACION_ID = {$id} 
                                and a.ANULADO <> 1
                                and coalesce(MONTO_afecto,0) > 0


        //Query Detalle Facturas Liquidación
        $detalle = DB::select("
                            select	 --Detalle Afecto al IVA
                                DocNum = a.id,
                                lineNum = 0,
                                ItemDescription =  c.DESCRIPCION + ' - ' + i.DESCRIPCION + ' '+ COALESCE(a.Serie,'') + ' - ' +  a.NUMERO,
                                PriceAfVAT = coalesce(a.TOTAL,0) - coalesce(A.MONTO_EXENTO,0), 
                                AccountCode = c.CUENTA_CONTABLE_AFECTO,
                                 TaxCode = CASE i.TIPOIMPUESTO_ID 
                                       WHEN 2 THEN RTRIM(c.CODIGO_IMPUESTO_EXENTO)
                                       ELSE RTRIM(c.CODIGO_IMPUESTO_AFECTO)	
                                     END,       
                                ProjectCode  = rtrim(ltrim(h.PROYECTO)),
                                CostingCode  = rtrim(ltrim(h.CENTROCOSTO1)),
                                CostingCode2 = rtrim(ltrim(h.CENTROCOSTO2)),
                                CostingCode3 = rtrim(ltrim(h.CENTROCOSTO3)),
                                CostingCode4 = rtrim(ltrim(h.CENTROCOSTO4)),
                                CostingCode5 = rtrim(ltrim(h.CENTROCOSTO5))
                            from 
                                liq_factura a inner join
                                cat_tipogasto c on a.TIPOGASTO_ID = c.ID 
                                                    and empresa_id = {$empresa_id}  inner join                                
                                liq_liquidacion d on a.liquidacion_id = d.id inner join
                                pre_detpresupuesto h on a.DETPRESUPUESTO_ID = h.ID inner join
                                cat_usuarioruta e on d.USUARIORUTA_ID = e.ID inner join                                
                                cat_tipodocumento i on a.TIPODOCUMENTO_ID = i.ID 
                            where 
                                a.LIQUIDACION_ID = {$id} 
                                and coalesce(MONTO_afecto,0) > 0
                            union all	
                            select 	--Detalle Exento de IVA
                                DocNum = a.id,
                                lineNum = 1,
                                Dscription =  c.DESCRIPCION + ' - ' + i.DESCRIPCION + ' '+ COALESCE(a.Serie,'') + ' - ' +  a.NUMERO,
                                PriceAfVAT = coalesce(A.MONTO_EXENTO,0),
                                c.CUENTA_CONTABLE_EXENTO,
                                c.CODIGO_IMPUESTO_EXENTO,
                                rtrim(ltrim(h.PROYECTO)),
                                rtrim(ltrim(h.CENTROCOSTO1)),
                                rtrim(ltrim(h.CENTROCOSTO2)),
                                rtrim(ltrim(h.CENTROCOSTO3)),
                                rtrim(ltrim(h.CENTROCOSTO4)),
                                rtrim(ltrim(h.CENTROCOSTO5))
                            from 
                                liq_factura a inner join
                                cat_tipogasto c on a.TIPOGASTO_ID = c.ID 
                                                    and empresa_id = {$empresa_id} inner join                                
                                liq_liquidacion d on a.liquidacion_id = d.id inner join
                                pre_detpresupuesto h on a.DETPRESUPUESTO_ID = h.ID inner join
                                cat_usuarioruta e on d.USUARIORUTA_ID = e.ID inner join                                
                                cat_tipodocumento i on a.TIPODOCUMENTO_ID = i.ID 
                            where 
                                LIQUIDACION_ID = {$id} 
                                and a.ANULADO <> 1
                                and coalesce(MONTO_EXENTO,0) > 0
                            order by
                                1



            //Query de Encabezado Nota de Crédito
            $notaCredito = collect(DB::select(" 
                                            Select Distinct
                                                DocNum		=	1, 
                                                DocType		=	'dDocument_Service',
                                                DocDate		=	case when k.AJUSTE_FINDEMES = 1 and day(d.FECHA_FINAL) >= COALESCE(DIA_EFECTIVO, 0) then 
                                                                    cast(cast(year(dateadd(month, 1, d.FECHA_FINAL)) as varchar) 
                                                                    + '-' 
                                                                    + cast(month(dateadd(month, 1, d.FECHA_FINAL)) as varchar) 
                                                                    + '-01' as DATE)
                                                                else
                                                                    d.FECHA_FINAL
                                                                end, 
                                                DocDueDate	=	d.FECHA_FINAL, 
                                                DocTaxDate	=	d.FECHA_FINAL, 
                                                CardCode    =	g.CODIGO_PROVEEDOR_SAP,
                                                NumAtCard	=	'REMANENTE',
                                                DocCurrency =	RTRIM(k.MONEDA_LOCAL),
                                                SalesPersonCode = g.USERSAP_ID,
                                                U_FacFecha  = d.FECHA_FINAL,
                                                U_FacSerie = '' ,
                                                U_FacNum =  $id ,
                                                U_FacNit = '12345678-9' ,
                                                U_FacNom = 'Usuario',
                                                U_Clase_LibroCV = 'N',
                                                U_Tipo_Documento = 'NC',
                                                BusinessObject = 'oPurchaseCreditNotes',
                                                Comentario = 'Devolución por no aplicar con la política',
                                                Foto = ''
                                            from 
                                                liq_factura a inner join                                           
                                                cat_subcategoria_tipogasto b on a.SUBCATEGORIA_TIPOGASTO_ID = b.ID inner join
                                                liq_liquidacion d on a.liquidacion_id = d.id inner join
                                                pre_detpresupuesto h on a.DETPRESUPUESTO_ID = h.ID inner join
                                                cat_usuarioruta e on d.USUARIORUTA_ID = e.ID inner join
                                                users f on e.USER_ID = f.id  inner join
                                                cat_usuarioempresa g on f.id = g.USER_ID
                                                                    and g.EMPRESA_ID = $empresa_id inner join
                                                cat_empresa k on g.EMPRESA_ID = k.ID 
                                                            
                                            where 
                                                a.LIQUIDACION_ID = $id 
                                                and a.ANULADO = 0
                                                and coalesce(a.MONTO_remanente,0) > 0


            //Query Detalle Nota de Crédito
            $detalleNotaCredito = DB::select("
                                                SELECT
                                                    DocNum = 1,
                                                    lineNum = 0,
                                                    ItemDescription =  c.DESCRIPCION,
                                                    PriceAfVAT = sum(a.MONTO_REMANENTE), 
                                                    AccountCode =	c.CUENTA_CONTABLE_REMANENTE,
                                                    TaxCode =		RTRIM(c.CODIGO_IMPUESTO_REMANENTE),
                                                    ProjectCode =	rtrim(ltrim(h.PROYECTO)),
                                                    CostingCode =	rtrim(ltrim(h.CENTROCOSTO1)),
                                                    CostingCode2 =	rtrim(ltrim(h.CENTROCOSTO2)),
                                                    CostingCode3 =	rtrim(ltrim(h.CENTROCOSTO3)),
                                                    CostingCode4 =	rtrim(ltrim(h.CENTROCOSTO4)),
                                                    CostingCode5 =	rtrim(ltrim(h.CENTROCOSTO5))
                                                from 
                                                    liq_factura a inner join
                                                    cat_tipogasto c on a.TIPOGASTO_ID = c.ID 
                                                                        and empresa_id = {$empresa_id} inner join                                                
                                                    liq_liquidacion d on a.liquidacion_id = d.id inner join
                                                    pre_detpresupuesto h on a.DETPRESUPUESTO_ID = h.ID inner join
                                                    cat_usuarioruta e on d.USUARIORUTA_ID = e.ID                                               
                                                                
                                                where 
                                                    a.LIQUIDACION_ID = {$id }
                                                    and coalesce(a.MONTO_remanente,0) > 0
                                                    and a.ANULADO = 0
                                                group by                                                
                                                    c.GRUPOTIPOGASTO_ID,                                            
                                                    --Detalle 
                                                    c.DESCRIPCION,
                                                    c.CUENTA_CONTABLE_REMANENTE,
                                                    RTRIM(c.CODIGO_IMPUESTO_REMANENTE),
                                                    rtrim(ltrim(h.PROYECTO)),
                                                    rtrim(ltrim(h.CENTROCOSTO1)),
                                                    rtrim(ltrim(h.CENTROCOSTO2)),
                                                    rtrim(ltrim(h.CENTROCOSTO3)),
                                                    rtrim(ltrim(h.CENTROCOSTO4)),
                                                    rtrim(ltrim(h.CENTROCOSTO5))
