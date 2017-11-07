/**
 *
 */
//{namespace name=backend/BestellungenNeuLager/view/lager}
Ext.define('Shopware.apps.BestellungenNeuLager.controller.Main', {
    extend: 'Enlight.app.Controller',


    snippets: {
        title: '{s name=neuLager/window_title}Kommissionierung Weißenfelder Straße (Klausnerring: [0] weitere Bestellungen){/s}',
        title1: '{s name=neuLager/window_title1}Kommissionierung Weißenfelder Straße (Klausnerring: [0] weitere Bestellung){/s}'
    },

    init: function() {
        var me = this;

        me.mainWindow = me.getView('main.Window').create({
            bestellungenLagerStore: me.getStore('BestellungenNeuLager').load({ }),
            title: Ext.String.format(me.snippets.title, 0)
        }).show();
        me.callParent(arguments);
        /*var runner = new Ext.util.TaskRunner(),
            task = runner.start({
                run: function() {
                    this.getStore('BestellungenLager').reload();
                },
                interval: 20000,
                repeat: 3
            });*/

        var updateOrders = function(){
            me.getStore('BestellungenNeuLager').reload(
                {
                    callback: function(records, operation, success) {
                        if (success == true) {

                            if(operation.response && operation.response.responseText){
                                var responseData = Ext.decode(operation.response.responseText);
                                if(responseData){
                                    if(responseData.countXXL ==1){
                                        me.mainWindow.setTitle(Ext.String.format(me.snippets.title1, responseData.countXXL));
                                    }else{
                                        me.mainWindow.setTitle(Ext.String.format(me.snippets.title, responseData.countXXL));
                                    }

                                }
                            }
                        }
                    }
                });
        }
        var task = {
            run: updateOrders,
            interval: 300000
        }
        var runner = new Ext.util.TaskRunner();

        var task = new Ext.util.DelayedTask(runner.start(task));
        task.delay(200000);
    }

});
