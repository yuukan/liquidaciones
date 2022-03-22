select 
	IdLiquidacion = al.id,
	IDLiquidacionDetalle = ald.id,
	DocType = 'dDocument_Service',
	DocDate =
	case
		when ae.ajuste_fin_mes = 1
		and day(ald.[date]) >= COALESCE(ae.dia_efectivo_ajuste ,
		0) then 
                                cast(cast(year(dateadd(month, 1, ald.[date])) as varchar) 
                                + '-' 
                                + cast(month(dateadd(month, 1, ald.[date])) as varchar) 
                                + '-01' as DATE)
		else
                                ald.[date]
	end,
	DocDueDate = ald.[date] ,
	DocTaxDate = ald.[date] ,
	CardCode = aue.codigo_proveedor_sap ,
	NumAtCard = COALESCE(ald.serie ,
	'') + ' - ' + ald.numero ,
	DocCurrency = RTRIM(ap.moneda_codigo),
	SalesPersonCode = aue.codigo_usuario_sap,
	U_FacFecha = ald.[date] ,
	U_FacSerie = coalesce(ald.serie ,
	'') ,
	U_FacNum = ald.numero ,
	U_facNit = ald.proveedor_label ,
	U_facNom = ap2.nombre,
	U_Clase_LibroCV = ltrim(rtrim(agg.sap)),
	'FC',
	businessObject = 'oPurchaseInvoices',
	Comentario = Coalesce(al.comentario ,
	''),
	ItemDescription = ag.descripcion + ' - ' + ald.serie + ' - ' + ald.numero,
	ald.total,
	PriceAfVAT =
	case
		when ald.cantidad >0 then 
            (CAST(ald.total as Float) / ald.cantidad)* ald.reembolso
		else
        ald.reembolso
	end,
	exento =
	case
		when ald.cantidad >0 then  
            (CAST(ald.total as Float) / ald.cantidad)* ald.exento
		else
        ald.exento
	end,
	remanennte =
	case
		when ald.cantidad >0 then 
            (CAST(ald.total as Float) / ald.cantidad)* ald.remanente
		else
        ald.remanente
	end,
	ag.exento_codigo,
	ag.afecto_codigo ,
	ag.remanente_codigo 
from
	au_liquidacion al
inner join au_liquidacion_detalle ald 
on
	ald.au_liquidacion_id = al.id
inner join au_presupuesto ap  
    on
	al.au_gasto_id = ap.id
inner join au_detalle_presupuesto adp 
	on 
	adp.au_presupuesto_id = ap.id
inner join au_gasto ag 
	on
	ald.gasto_value = ag.id
inner join au_empresa ae 
    on
	ap.empresa_codigo = ae.id
inner join au_usuario_empresa aue 
	on 
	aue.au_empresa_id = ae.id
	and al.au_usuario_id = aue.au_usuario_id
inner join au_proveedor ap2 
	on 
		ald.proveedor_value = ap2.id
inner join au_gasto_grupo agg 
	on
	agg.id = ag.au_gasto_grupo_id
order by
	IDLiquidacionDetalle