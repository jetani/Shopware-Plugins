/**
 *
 */
Ext.define('Shopware.apps.BestellungenNeuLager', {
    extend: 'Enlight.app.SubApplication',

    name:'Shopware.apps.BestellungenNeuLager',

    loadPath: '{url action=load}',
    bulkLoad: true,

    controllers: [ 'Main', 'BestellungenNeuLager'],

    models: ['BestellungenNeuLager'],

    views: [
        'main.Window',
        'list.List'
    ],
    stores: ['BestellungenNeuLager'],


    launch: function() {

        return this.getController('Main').mainWindow;
    }

});