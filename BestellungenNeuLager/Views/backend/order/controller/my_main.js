/**
 *
 */
//{block name="backend/order/controller/main append"}
//{namespace name=backend/order/main}
Ext.define('Shopware.apps.Order.controller.MyMain', {

    override: 'Shopware.apps.Order.controller.Main',

    showOrder: function(record) {

        /*{if {acl_is_allowed privilege=update resource=order}}*/
        this.callParent(arguments)
        /*{/if}*/
    }

});
//{/block}
