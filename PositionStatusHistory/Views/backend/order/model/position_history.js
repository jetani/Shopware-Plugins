/**
 *
 */
Ext.define('Shopware.apps.Order.model.PositionHistory', {
    extend: 'Shopware.data.Model',

    idProperty:'id',
    /**
     * The fields used for this model
     * @array
     */
    configure: function() {
        return {
            controller: 'PositionStatusHistory'

        };
    },

    fields: [
        { name : 'id', type: 'int' },
        { name : 'orderId', type: 'int' },
        { name : 'articleNumber', type: 'string' },
        { name : 'userName', type: 'string' },
        { name : 'changeDate', type: 'string' },
        { name : 'prevPositionStatus', type: 'string' },
        { name : 'currentPositionStatus', type: 'string' }
    ]/*,

    proxy: {
        type: 'ajax',
        api: {
            read:'{url controller="PositionStatusHistory" action="getSpeditionLabel"}'
        },
        reader: {
            type: 'json',
            root: 'data'
        }
    }*/
});