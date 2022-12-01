/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/message'],
    /**
     * @param{message} message
     */
function(message) {
    
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
        try {
            var customMsg = message.create({
                title: "Error",
                message: "No se puede renderizar su plantilla, verifique el formato de PDF avanzado",
                type: message.Type.ERROR
            });
            customMsg.show();
        } catch (e) {
            console.error(e);
        }
    }

    return {
        pageInit: pageInit,
    };
    
});
