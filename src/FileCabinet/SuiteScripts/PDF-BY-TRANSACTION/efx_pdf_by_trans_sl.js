/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/render', 'N/record', 'N/ui/serverWidget', 'N/search'],
    /**
     * @param{log} log
     * @param{render} render
     * @param{record} record
     * @param{serverWidget} serverWidget
     * @param{search} search
     */
    function (log, render, record, serverWidget, search) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {

            try {
                var request = context.request, params = request.parameters, response = context.response;
                var typeRecord = params.typeRecord;

                // Recepcion de parametros
                if (typeRecord != "check") {
                    if (typeRecord == "itemfulfillment") {
                        var templateID = params.templateID, recordID = params.recordID, savedSearch = params.savedSearch, requiredSearch = params.requiredSearch;
                        log.audit('remision params data', {
                            templateID: templateID,
                            recordID: recordID,
                            typeRecord: typeRecord,
                            savedSearch: savedSearch,
                            requiredSearch: requiredSearch
                        });
                    }else{
                        var generic_templateID = params.generic_templateID, recordID = params.recordID, savedSearch = params.savedSearch, requiredSearch = params.requiredSearch;
                        log.audit('generic params data', {
                            generic_templateID: generic_templateID,
                            recordID: recordID,
                            typeRecord: typeRecord,
                            savedSearch: savedSearch,
                            requiredSearch: requiredSearch
                        });

                    }
                } else {
                    var templateIDBanorte = params.templateIDBanorte, templateIDBancomer = params.templateIDBancomer, recordID = params.recordID;
                    log.audit('params data cheques', {
                        templateIDBanorte: templateIDBanorte,
                        templateIDBancomer: templateIDBancomer,
                        recordID: recordID,
                        typeRecord: typeRecord
                    });
                }

                log.audit({ title: 'recordID', details: recordID });
                log.audit({ title: 'typeRecord', details: typeRecord });

                if (requiredSearch == false || requiredSearch == "false") {
                    if (typeRecord != "check") {
                        if (typeRecord == "itemfulfillment") {
                            var renderer = render.create();
                            renderer.setTemplateById(templateID);

                            var tran_obj = record.load({
                                type: typeRecord,
                                id: recordID
                            });

                            var tran_st = JSON.stringify(tran_obj);
                            var tran = JSON.parse(tran_st);
                            log.audit({ title: 'tran', details: tran });

                            var idCreated = tran_obj.getValue("createdfrom");
                            log.audit({ title: 'idCreated', details: idCreated });

                            var OVdata = loadODV(idCreated);
                            var customData = {
                                odvdata: OVdata
                            }

                            renderer.addRecord({
                                templateName: 'record',
                                record: tran_obj,
                            });
                            renderer.addCustomDataSource({
                                alias: 'custom',
                                format: render.DataSource.OBJECT,
                                data: customData
                            });

                            log.audit({ title: 'customData', details: JSON.stringify(customData) });
                            var transactionFile = renderer.renderAsPdf();

                            if (transactionFile) {
                                response.writeFile({
                                    file: transactionFile,
                                    isInline: true
                                });
                            }

                        }else{
                            var renderer = render.create();
                            renderer.addRecord({
                                templateName: 'record',
                                record: record.load({
                                    type: typeRecord,
                                    id: recordID
                                })
                            });

                            renderer.setTemplateById(generic_templateID);
                            var transactionFile = renderer.renderAsPdf();

                            if (transactionFile) {
                                response.writeFile({
                                    file: transactionFile,
                                    isInline: true
                                });
                            }
                        }

                    } else {
                        var renderer = render.create();
                        renderer.addRecord({
                            templateName: 'record',
                            record: record.load({
                                type: typeRecord,
                                id: recordID
                            })
                        });

                        var datosCheque = search.lookupFields({
                            type: typeRecord,
                            id: recordID,
                            columns: ['custbody_tko_pbt_banco', 'subsidiary']
                        });
                        log.audit({ title: 'datos del cheque', details: datosCheque });

                        var data = loadDataSub(datosCheque.subsidiary[0].value, datosCheque.subsidiary[0].text);
                        var custData = {
                            customData: data
                        }
                        log.audit({ title: 'custData', details: custData });

                        renderer.addCustomDataSource({
                            alias: 'custom',
                            format: render.DataSource.OBJECT,
                            data: custData
                        })

                        if (datosCheque.custbody_tko_pbt_banco[0].text == "Banorte") {
                            renderer.setTemplateById(templateIDBanorte);
                        } else if (datosCheque.custbody_tko_pbt_banco[0].text == "Bancomer") {
                            renderer.setTemplateById(templateIDBancomer);
                        } else {
                            renderer.setTemplateById(templateID);
                        }

                        var transactionFile = renderer.renderAsPdf();

                        if (transactionFile) {
                            response.writeFile({
                                file: transactionFile,
                                isInline: true
                            });
                        }
                    }
                } else {
                    if (typeRecord != "check") {
                        log.audit({ title: 'requiredSearch', details: requiredSearch });
                        log.audit({title: 'savedSearch', details: savedSearch});
                        var renderer = render.create();
                        renderer.addRecord({
                            templateName: 'record',
                            record: record.load({
                                type: typeRecord,
                                id: recordID
                            })
                        });

                        var searchLoad = search.load({ id: savedSearch });
                        var filters = searchLoad.filters;
                        log.audit({title: 'filters', details: filters});
                        var custom_filters = search.createFilter({
                            name: 'internalid',
                            operator: search.Operator.IS,
                            values: recordID
                        });
                        filters.push(custom_filters);
                        log.audit({title: 'custom_filters', details: custom_filters});
                        searchLoad.filters = filters;
                        log.audit({title: 'filtros customizados', details: searchLoad.filters});

                        var run_search = searchLoad.run();
                        var results = run_search.getRange(0, 1000);
                        log.audit({title: 'results', details: results});

                        var custData = {
                            customData: results
                        }
                        log.audit({title: 'custData', details: custData});

                        renderer.addCustomDataSource({
                            alias: 'custom',
                            format: render.DataSource.OBJECT,
                            data: custData
                        });
                        /* renderer.addSearchResults({
                            templateName: 'results',
                            searchResult: results
                        }); */
                        // !Aqui va el id del parametro de PDF generico
                        renderer.setTemplateById(generic_templateID);

                        var transactionFile = renderer.renderAsPdf();
                        if (transactionFile) {
                            response.writeFile({
                                file: transactionFile,
                                isInline: true
                            })
                        }
                    }else{
                        var renderer = render.create();
                        renderer.addRecord({
                            templateName: 'record',
                            record: record.load({
                                type: typeRecord,
                                id: recordID
                            })
                        });

                        var datosCheque = search.lookupFields({
                            type: typeRecord,
                            id: recordID,
                            columns: ['custbody_tko_pbt_banco', 'subsidiary']
                        });
                        log.audit({ title: 'datos del cheque', details: datosCheque });

                        var data = loadDataSub(datosCheque.subsidiary[0].value, datosCheque.subsidiary[0].text);
                        var custData = {
                            customData: data
                        }
                        log.audit({ title: 'custData', details: custData });

                        renderer.addCustomDataSource({
                            alias: 'custom',
                            format: render.DataSource.OBJECT,
                            data: custData
                        })

                        if (datosCheque.custbody_tko_pbt_banco[0].text == "Banorte") {
                            renderer.setTemplateById(templateIDBanorte);
                        } else if (datosCheque.custbody_tko_pbt_banco[0].text == "Bancomer") {
                            renderer.setTemplateById(templateIDBancomer);
                        } else {
                            renderer.setTemplateById(templateID);
                        }

                        var transactionFile = renderer.renderAsPdf();

                        if (transactionFile) {
                            response.writeFile({
                                file: transactionFile,
                                isInline: true
                            });
                        }
                    }
                }
            } catch (e) {
                log.error('Error on onRequest', e);
                var formError = serverWidget.createForm({
                    title: ' '
                });
                if (typeRecord != "check") {
                    if (typeRecord == "itemfulfillment") {
                        formError.clientScriptModulePath = './efx_pdf_by_tran_error_cs.js';
                    }
                    formError.clientScriptModulePath = './efx_pdf_by_tran_generic_error_cs.js';
                } else {
                    formError.clientScriptModulePath = './efx_pdf_by_tran_error_cs_cheques.js';

                }
                context.response.writePage(formError);
            }

        }

        function loadDataSub(idSubs, textSubs) {
            log.audit({ title: 'idSubs', details: idSubs });
            log.audit({ title: 'textSubs', details: textSubs });
            var datos = []
            var subsidiary_record = record.load(
                { type: record.Type.SUBSIDIARY, id: idSubs, isDynamic: true }
            );
            direccion = subsidiary_record.getValue({ fieldId: 'mainaddress_text' });
            // log.audit({title: 'datos de la subsidiaria', details: direccion});
            rfc = subsidiary_record.getSublistValue({
                sublistId: 'taxregistration',
                fieldId: 'taxregistrationnumber',
                line: 0
            });
            log.audit({ title: 'rfc', details: rfc });

            datos.push({
                dir: direccion,
                rfc: rfc
            });
            log.audit({ title: 'datos', details: datos });
            return datos;

        }

        function loadODV(idOV) {
            var data = [];
            var tran_obj_ov = record.load({
                type: record.Type.SALES_ORDER,
                id: idOV
            });

            var trans_st = JSON.stringify(tran_obj_ov);
            var odv = JSON.parse(trans_st)
            log.audit({ title: 'odv', details: odv });

            var numLines = tran_obj_ov.getLineCount({
                sublistId: 'item'
            });
            log.audit({ title: 'numLines', details: numLines });

            for (var item = 0; item < numLines; item++) {
                data.push({
                    item: tran_obj_ov.getSublistValue({ sublistId: 'item', fieldId: 'item', line: item }),
                    line: tran_obj_ov.getSublistValue({ sublistId: 'item', fieldId: 'line', line: item }),
                    rate: tran_obj_ov.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: item }),
                    tax_json_line: tran_obj_ov.getSublistValue({ sublistId: 'item', fieldId: 'custcol_efx_fe_tax_json', line: item }),
                    quantity_odv: tran_obj_ov.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: item }),
                    grossamt: tran_obj_ov.getSublistValue({ sublistId: 'item', fieldId: 'grossamt', line: item })
                });
            }
            /* data.push({
                // ! Revisar muy bien que funcione esta idea de llevarse el tax_json
                tax_json: tran_obj_ov.getValue({ fieldId: 'custbody_efx_fe_tax_json'})
            }) */
            log.audit({ title: 'data', details: data });
            return data;
        }

        return {
            onRequest: onRequest
        };

    });
