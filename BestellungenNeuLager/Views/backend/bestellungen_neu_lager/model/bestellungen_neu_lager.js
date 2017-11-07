/**
 *
 */
Ext.define('Shopware.apps.BestellungenNeuLager.model.BestellungenNeuLager', {
    extend: 'Ext.data.Model',

    idProperty:'id',

    fields: [
        { name : 'id', type: 'int' },
        { name : 'lock', type: 'int' },
        { name : 'number', type: 'string' },
        { name : 'invoiceNumber', type: 'string' },
        { name : 'customerId', type: 'int' },
        { name : 'comment', type: 'string' },
        { name : 'customerComment', type: 'string' },
        { name : 'internalComment', type: 'string' },
        { name : 'dispatchId', type: 'int' },
        { name : 'isAlreadyPrinted', type: 'int' },
        { name : 'invoiceShipping', type: 'float' },
        { name : 'orderTime', type: 'date' },
        { name : 'pickupDate', type: 'string' },
        { name : 'bearbeiter', type: 'string' },
        { name: 'fastorderlogo', type: 'string', useNull: true },
        { name: 'magnalisterlogo', type: 'string', useNull: true }
    ],

    proxy: {
        type: 'ajax',
        api: {
            read:'{url controller="BestellungenNeuLager" action="getLagerOrdersList"}'
        },
        reader: {
            type: 'json',
            root: 'data',
            countXXLProperty: 'countXXL'
        }
    },

    associations:[
        { type:'hasMany', model:'Shopware.apps.Base.model.Customer', name:'getCustomer', associationKey:'customer' },
        { type:'hasMany', model:'Shopware.apps.Order.model.Debit', name:'getDebit', associationKey:'debit' },
        { type:'hasMany', model:'Shopware.apps.Base.model.Dispatch', name:'getDispatch', associationKey:'dispatch' },
        { type:'hasMany', model:'Shopware.apps.Order.model.Billing', name:'getBilling', associationKey:'billing' },
        { type:'hasMany', model:'Shopware.apps.Order.model.Receipt', name:'getReceipt', associationKey:'documents' }
    ]

});