/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/ui/message', 'N/search'],
/**
 * @param{url} url
 * @param{message} message
 * @param{search} search
 */
function(url, message, search) {

    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {

    }

    function renderButtonRemision (templateID, typeRecord, recordID, savedSerachID, requiredSearch) {
        try {
            console.log("templateID",templateID);
            if (templateID) {
                console.log("typeRecord remision", typeRecord);
                var urlResolve = url.resolveScript({
                    scriptId: 'customscript_efx_pdf_by_transaction_sl',
                    deploymentId: 'customdeploy_efx_pdf_by_transaction_sl',
                    params: {
                        templateID: templateID,
                        typeRecord: typeRecord,
                        recordID: recordID,
                        savedSearch: savedSerachID,
                        requiredSearch: requiredSearch
                    }
                });
                window.open(urlResolve, '_blank');
            }
            else {
                var customMsg = message.create({
                    title: "Error",
                    message: "No se encuentra configurado la plantilla para renderizar",
                    type: message.Type.ERROR,
                    duration: 15000
                });

                customMsg.show();
            }
        } catch (e) {

        }
    }

    function renderButtonCheques (templateIDBanorte, templateIDBancomer, typeRecord, recordID){
        try {
            if(templateIDBanorte || templateIDBancomer ){
                console.log("templateIDBanorte", templateIDBanorte);
                console.log("templateIDBancomer", templateIDBancomer);
                console.log("typeRecord cheques", typeRecord);
                console.log("recordID", recordID);
                var urlResolveCheques = url.resolveScript({
                    scriptId: 'customscript_efx_pdf_by_transaction_sl',
                    deploymentId: 'customdeploy_efx_pdf_by_transaction_sl',
                    params: {
                        typeRecord: typeRecord,
                        recordID: recordID,
                        templateIDBanorte: templateIDBanorte,
                        templateIDBancomer: templateIDBancomer
                    }
                });
                window.open(urlResolveCheques, '_blank');
            }
            else {
                var customMsg = message.create({
                    title: "Error",
                    message: "No se encuentra configurado la plantilla para renderizar",
                    type: message.Type.ERROR,
                    duration: 15000
                });

                customMsg.show();
            }
        } catch (error) {

        }
    }

    return {
        pageInit: pageInit,
        renderButtonRemision: renderButtonRemision,
        renderButtonCheques: renderButtonCheques
    };

});
