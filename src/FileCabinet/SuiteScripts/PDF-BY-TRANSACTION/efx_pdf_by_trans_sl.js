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
function(log, render, record, serverWidget, search) {
   
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
            var templateID = params.templateID, recordID = params.recordID, typeRecord = params.typeRecord, savedSearch = params.savedSearch, requiredSearch = params.requiredSearch;
            log.audit('params data', {
                templateID: templateID,
                recordID: recordID,
                typeRecord: typeRecord,
                savedSearch: savedSearch,
                requiredSearch: requiredSearch
            });


            if (requiredSearch === false || requiredSearch === 'false') {
                var renderer = render.create();
                renderer.addRecord({
                    templateName: 'results',
                    record: record.load({
                        type: typeRecord,
                        id: recordID
                    })
                });

                renderer.setTemplateById(templateID);

                var transactionFile = renderer.renderAsPdf();

                if (transactionFile) {
                    response.writeFile({
                        file: transactionFile,
                        isInline: true
                    });
                }
            } else {
                var renderer = render.create();
                var searchLoad = search.load({id: savedSearch});
                var filters = searchLoad.filters;
                log.audit({title:'Filters', details:filters});
                var customFltr = search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.IS,
                    values: recordID
                });
                filters.push(customFltr);
                searchLoad.filters = filters;
                log.audit({title:'filters mod', details: searchLoad.filters});
                var rs = searchLoad.run();
                var results = rs.getRange(0, 1000);
                renderer.addSearchResults({
                    templateName: 'results',
                    searchResult: results
                });
                renderer.setTemplateById(templateID);

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
            formError.clientScriptModulePath = './efx_pdf_by_tran_error_cs.js';
            context.response.writePage(formError);
        }

    }

    return {
        onRequest: onRequest
    };
    
});
