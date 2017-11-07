/*
 * 
 */
///{block name="backend/order/view/detail/window" append}
//{namespace name=backend/order/view/positionhistory}
Ext.define('Shopware.apps.Order.view.detail.PositionWindow', {
    override: 'Shopware.apps.Order.view.detail.Window',

    createTabPanel: function () {

        var me = this;
        me.orderId = me.record.getData().id;
        var tabPanel = me.callParent(arguments);
        tabPanel.insert(6,me.createPositionHistoryTab());
        return tabPanel;
    },

    createPositionHistoryTab:function () {
        var me = this,
            gridStore = Ext.create('Shopware.apps.Order.store.PositionHistory');

        gridStore.getProxy().extraParams = { orderId:me.record.data.id };

        me.positionHistoryGrid = Ext.create('Shopware.apps.Order.view.detail.PositionHistory', {
            title: 'Position History',
            positionHistoryStore: gridStore.load(),
            orderId: me.orderId
        });

        return me.positionHistoryGrid;
        /*return Ext.create('Ext.container.Container', {
            layout: {
                type: 'vbox',
                align : 'stretch'
            },
            defaults: { flex: 1 },
            title: 'Position History',
            items: [ me.offerGrid ]
        });*/
    }
});
//{/block}