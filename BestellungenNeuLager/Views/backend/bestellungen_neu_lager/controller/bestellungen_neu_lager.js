/**
 *
 */
//{namespace name=backend/BestellungenNeuLager/view/lager}
Ext.define('Shopware.apps.BestellungenNeuLager.controller.BestellungenNeuLager', {

    /**
     * Defines that this component is a extJs controller extension
     * @string
     */
    extend:'Ext.app.Controller',

    /**
     * @return void
     */
    init:function () {
        var me = this;
        me.control({
            'bestellungen-neu-lager-window bestellungen-neu-lager-list': {
                searchOrders: me.onSearchOrders
            }
        });
        me.callParent(arguments);
    },

    onSearchOrders: function(value) {
        var me = this,
            store = me.subApplication.getStore('BestellungenNeuLager');

        if (store.filters.containsKey('free')) {
            store.filters.removeAtKey('free');
        }
        store.filters.add('free', Ext.create('Ext.util.Filter', { property: 'free', value: Ext.String.trim(value) }));

        //scroll the store to first page
        store.currentPage = 1;

        store.filter();
    }
});
