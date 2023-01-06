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

                if (typeRecord != "check") {
                    var templateID = params.templateID, recordID = params.recordID;
                    log.audit('params data remision', {
                        templateID: templateID,
                        templateIDBanorte: templateIDBanorte,
                        templateIDBancomer: templateIDBancomer,
                        recordID: recordID,
                        typeRecord: typeRecord
                    });
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
                if (typeRecord != "check") {
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
                } else {
                    var renderer = render.create();
                    renderer.addRecord({
                        templateName: 'record',
                        record: record.load({
                            type: typeRecord,
                            id: recordID
                        })
                    });

                    var banco = search.lookupFields({
                        type: typeRecord,
                        id: recordID,
                        columns: 'custbody_tko_pbt_banco'
                    });

                    log.audit({title: 'banco', details: banco});

                    if (banco.custbody_tko_pbt_banco[0].text == "Banorte") {
                        renderer.setTemplateById(templateIDBanorte);
                    } else if (banco.custbody_tko_pbt_banco[0].text == "Bancomer"){
                        renderer.setTemplateById(templateIDBancomer);
                    }else{
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
            } catch (e) {
                log.error('Error on onRequest', e);
                var formError = serverWidget.createForm({
                    title: ' '
                });
                if (typeRecord != "check") {
                    formError.clientScriptModulePath = './efx_pdf_by_tran_error_cs.js';
                } else {
                    formError.clientScriptModulePath = './efx_pdf_by_tran_error_cs_cheques.js';

                }
                context.response.writePage(formError);
            }

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
                    grossamt: tran_obj_ov.getSublistValue({ sublistId: 'item', fieldId: 'grossamt', line: item })
                });
            }
            log.audit({ title: 'data', details: data });
            return data;
        }

        return {
            onRequest: onRequest
        };

    });
