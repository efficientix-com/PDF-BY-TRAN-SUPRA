/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/runtime', 'N/record', 'N/search'],
/**
 * @param{log} log
 * @param{runtime} runtime
 * @param{record} record
 * @param{search} search
 */
function(log, runtime, record, search) {

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
        try {
            var form = scriptContext.form;
            var objRecord = scriptContext.newRecord;
            var typeTransaction = objRecord.type;
            var scriptObj = runtime.getCurrentScript();
            var templateID = scriptObj.getParameter({name: 'custscript_id_template_pdf'});
            var templateIDBanorte = scriptObj.getParameter({name: 'custscript_id_template_pdf_banorte'});
            var templateIDBancomer = scriptObj.getParameter({name: 'custscript_id_template_pdf_bancomer'});
            var requiredSearch = scriptObj.getParameter({name: 'custscript_required_search'});
            var savedsearch = scriptObj.getParameter({name: 'custscript_id_saved_search'});

            if (typeTransaction != "check") {
                var status = objRecord.getValue("status");
                log.audit({title: 'status', details: status});
                if (scriptContext.type === scriptContext.UserEventType.VIEW && status === "Enviado") {
                    log.audit({title:'cheques', details: 'caso de cheques'});
                    log.audit({title:'account id', details: runtime.accountId});
                    log.audit('transaction parameters', {
                        typeTransaction: typeTransaction,
                        templateID: templateID,
                        templateIDBanorte: templateIDBanorte,
                        templateIDBancomer:templateIDBancomer,
                        recordID : objRecord.id,
                        requiredSearch: requiredSearch,
                        savedsearchID: savedsearch
                    });

                    form.addButton({
                        id: 'custpage_btn_pdf_template',
                        label: 'Impresión de Remisión',
                        functionName: 'renderButtonRemision(' + templateID + ',"' + typeTransaction + '",' + objRecord.id + ',"'+savedsearch+'",'+requiredSearch+')'
                    });
                    form.clientScriptModulePath = './efx_pdf_by_tran_cs.js';
                }
            } else {
                log.audit({title: 'tipo', details: typeTransaction});
                if (scriptContext.type === scriptContext.UserEventType.VIEW) {

                    log.audit({title:'cheques', details: 'caso de cheques'});

                    log.audit('transaction parameters antes d eenviar a CS', {
                        templateIDBanorte: templateIDBanorte,
                        templateIDBancomer:templateIDBancomer,
                        typeTransaction: typeTransaction,
                        recordID : objRecord.id
                    });

                    log.audit({title: 'funcion del CS en UE', details: 'renderButtonCheques(' + templateIDBanorte + templateIDBancomer + ',"' + typeTransaction + '",' + objRecord.id + ')'});
                    form.addButton({
                        id: 'custpage_btn_pdf_template',
                        label: 'Impresión de Cheque',
                        functionName: 'renderButtonCheques(' + templateIDBanorte + ',' + templateIDBancomer + ',"' + typeTransaction + '",' + objRecord.id + ')'
                    });
                    form.clientScriptModulePath = './efx_pdf_by_tran_cs.js';
                }
            }
        } catch (e) {
            log.error('Error on before load', e);
        }
    }

    return {
        beforeLoad: beforeLoad
    };

});
