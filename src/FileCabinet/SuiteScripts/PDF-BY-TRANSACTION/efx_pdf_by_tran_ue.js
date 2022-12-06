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
            var requiredSearch = scriptObj.getParameter({name: 'custscript_required_search'});
            var savedsearch = scriptObj.getParameter({name: 'custscript_id_saved_search'});

            var status = objRecord.getValue("status");
            log.audit({title: 'status', details: status});
            if (scriptContext.type === scriptContext.UserEventType.VIEW && status === "Enviado") {

                log.audit({title:'account id', details: runtime.accountId});
                log.audit('transaction parameters', {typeTransaction: typeTransaction, templateID: templateID, recordID : objRecord.id, requiredSearch: requiredSearch,
                savedsearchID: savedsearch});

                form.addButton({
                    id: 'custpage_btn_pdf_template',
                    label: 'Impresión de Remisión',
                    functionName: 'renderButton(' + templateID + ',"' + typeTransaction + '",' + objRecord.id + ',"'+savedsearch+'",'+requiredSearch+')'
                });
                form.clientScriptModulePath = './efx_pdf_by_tran_cs.js';
            }
        } catch (e) {
            log.error('Error on before load', e);
        }
    }

    return {
        beforeLoad: beforeLoad
    };

});
