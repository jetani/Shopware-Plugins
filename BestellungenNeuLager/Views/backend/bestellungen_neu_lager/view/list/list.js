/**
 *
 */
//{namespace name=backend/BestellungenNeuLager/view/lager}
Ext.define('Shopware.apps.BestellungenNeuLager.view.list.List', {

    extend:'Ext.grid.Panel',

    alias:'widget.bestellungen-neu-lager-list',

    cls:Ext.baseCSSPrefix + 'bestellungen-neu-lager-list',

    region:'center',

    autoScroll:true,

    refs: [
        { ref: 'NeuLagerGrid', selector: 'bestellungen-neu-lager-list' },
    ],
    snippets:{
        columns: {
            number:'{s name=column/number}Bestellnummer{/s}',
            orderTime:'{s name=column/order_time}Bestell-Zeit{/s}',
            invoiceNumber:'{s name=column/invoice_number}Rechnungsnummer{/s}',
            dispatchName:'{s name=column/dispatch_name}Versand{/s}',
            pickupDate:'{s name=column/pickup_date}Abholdatum{/s}',
            customer:'{s name=column/customer}Kunde{/s}',
            bearbeiter:'{s name=column/bearbeiter}Bearbeiter{/s}',
            deleteOrder: '{s name=column/delete_order}Delete order{/s}',
            detail: '{s name=column/detail}Show details{/s}'
        },
        externalComment: '{s name=external_comment}External comment{/s}',
        customerComment: '{s name=customer_comment}Customer comment{/s}',
        internalComment: '{s name=internal_comment}Internal comment{/s}',
        toolbar: {
            search: '{s name=toolbar/search}Suche...{/s}',
            action: '{s name=toolbar/action}Perform action{/s}',
        },
        paging: {
            pageSize: '{s name=paging_bar/page_size}Anzahl der Bestellungen{/s}'
        }
    },

    viewConfig: {
        enableTextSelection: true
    },



    /*
     * @return void
     */
    initComponent:function () {
        var me = this;

        me.store = me.bestellungenLagerStore;
        me.selModel = me.getGridSelModel();
        me.columns = me.getColumns();
        me.toolbar = me.getToolbar();
        me.pagingbar = me.getPagingBar();
        me.dockedItems = [ me.toolbar, me.pagingbar ];
        me.plugins = me.createPlugins();
        me.callParent(arguments);
    },

    createPlugins: function() {
        var me = this,
            rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
                clicksToEdit: 2,
                autoCancel: true,
                listeners: {
                    scope: me,
                    edit: function(editor, e) {
                        me.fireEvent('saveOrder', editor, e, me.bestellungenLagerStore)
                    }
                }
            });

        return [ rowEditor ];
    },

    /**
     * Creates the paging toolbar for the customer grid to allow
     * and store paging. The paging toolbar uses the same store as the Grid
     *
     * @return Ext.toolbar.Paging The paging toolbar for the customer grid
     */
    getPagingBar:function () {
        var me = this;

        var pageSize = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: me.snippets.paging.pageSize,
            labelWidth: 155,
            cls: Ext.baseCSSPrefix + 'page-size',
            queryMode: 'local',
            width: 250,
            listeners: {
                scope: me,
                select: me.onPageSizeChange
            },
            store: Ext.create('Ext.data.Store', {
                fields: [ 'value' ],
                data: [
                    { value: '20' },
                    { value: '40' },
                    { value: '60' },
                    { value: '80' },
                    { value: '100' }
                ]
            }),
            displayField: 'value',
            valueField: 'value'
        });
        pageSize.setValue(me.bestellungenLagerStore.pageSize);

        var pagingBar = Ext.create('Ext.toolbar.Paging', {
            store: me.bestellungenLagerStore,
            dock:'bottom',
            displayInfo:true
        });

        pagingBar.insert(pagingBar.items.length - 2, [ { xtype: 'tbspacer', width: 6 }, pageSize ]);

        return pagingBar;

    },

    onPageSizeChange: function(combo, records) {
        var record = records[0],
            me = this;

        me.bestellungenLagerStore.pageSize = record.get('value');
        me.bestellungenLagerStore.loadPage(1);
    },


    getColumns:function () {
        var me = this;

        var columns = [
            {
                dataIndex: 'lock',
                hidden: true
            },
            {
                header: me.snippets.columns.orderTime,
                dataIndex: 'orderTime',
                flex:1,
                renderer:me.dateColumn
            },
            {
                header: me.snippets.columns.number,
                dataIndex: 'number',
                flex:1
            },
            {
                header: me.snippets.columns.invoiceNumber,
                dataIndex: 'invoiceNumber',
                flex:1
            },
            {
                header: me.snippets.columns.dispatchName,
                dataIndex: 'dispatchId',
                flex:1,
                renderer: me.dispatchColumn
            },
            {
                header: me.snippets.columns.customer,
                dataIndex: 'customerId',
                flex:2,
                renderer: me.customerColumn
            },
            {
                header: 'magnalister logo',
                dataIndex: 'magnalisterlogo',
                flex: 1,
                sortable: false,
                renderer: function (p, v, r) {
                    return  r.get('magnalisterlogo');
                }
            },
            {
                header: me.snippets.columns.bearbeiter,
                dataIndex: 'bearbeiter',
                flex: 1
            },
            me.createPreparePrintsColumn(),
            /*{if {acl_is_allowed privilege=update}}*/
            me.createUnlockColumn()
            /*{/if}*/
        ];

        return columns;
    },

    createUnlockColumn: function () {
        var me = this;

        return {
            header: '',
            dataIndex: 'isAlreadyPrinted',
            width: 30,
            renderer: me.unlockColumn,
            listeners: {
                click: function (a, b, c) {

                    var store = a.getStore(),
                        record = store.getAt(c);

                    var id = record.get('id');
                    var lock = record.get('lock');

                    Ext.Ajax.request({
                        url: '{url controller=BestellungenNeuLager action=unlockOrder}',
                        method: 'POST',
                        cls: "createLabelBtn",
                        waitMsg: 'Please Wait...',
                        params: {
                            orderId: id
                        },
                        success: function (response) {
                            var decodeddata = Ext.decode(response.responseText);
                            if (decodeddata.success === true) {
                                me.bestellungenLagerStore.load();
                                Shopware.Notification.createGrowlMessage("Erfolgreich", "Erfolgreich freigegeben die Bestellung. So kannst du es wieder ausdrucken", "Kommissionierungsansicht");
                            }
                        }
                    });
                }
            }
        }
    },

    createPreparePrintsColumn: function () {
        var me = this;

        return {
            header: 'SP',
            dataIndex: '1',
            width:40,
            listeners: {
                click: function(a,b,c) {

                    me.myMask = new Ext.LoadMask(a);
                    me.myMask.show();

                    var store = a.getStore(),
                        record = store.getAt(c);

                    var id = record.get('id');
                    var lock = record.get('lock');

                    Ext.Ajax.request({
                        url: '{url controller=BestellungenNeuLager action=getOrderStateCommi}',
                        method:'POST',
                        cls:"createLabelBtn",
                        waitMsg : 'Please Wait...',
                        params: {
                            orderId:id
                        },
                        success: function(response){
                            var decodeddata = Ext.decode(response.responseText);
                            if(decodeddata.success === true){
                                me.roleID = decodeddata.roleID;
                                me.user1 = decodeddata.user1;

                                //Ext.Msg.alert('Information', 'Labels & Rechnung wurden in den Druckprozess übergeben!');
                                var result = false;
                                Ext.Ajax.request({
                                    url: '{url controller=Smartpackaging action=getSmartPackages}',
                                    method:'POST',
                                    async:false,
                                    params: {
                                        orderId:id
                                    },
                                    success: function(response){
                                        var decodeddata = Ext.decode(response.responseText);
                                        if(decodeddata.success === true){
                                            result = decodeddata;
                                            window.smartpackageReturn = decodeddata;

                                            if(me.roleID == 1){
                                                me.myMask.hide();
                                                Ext.Msg.show({
                                                    title: 'Bitte auswählen',
                                                    msg: 'Wo soll gedruckt werden?',
                                                    width: 300,
                                                    closable: false,
                                                    buttons: Ext.Msg.YESNO,
                                                    buttonText: {
                                                        yes: 'Packtisch 1',
                                                        no: 'Packtisch 2'
                                                    },
                                                    multiline: false,
                                                    callback: function (buttonValue, inputText, showConfig) {
                                                        /*Ext.Msg.alert('Status', buttonValue);*/

                                                        if(buttonValue == "yes"){
                                                            me.selectedPrinter = "1";
                                                        }else{
                                                            me.selectedPrinter = "2";
                                                        }

                                                        Ext.Ajax.request({
                                                            url: '{url controller=Smartpackaging action=preparePrints}',
                                                            method:'POST',
                                                            cls:"createLabelBtn",
                                                            async:false,
                                                            params: {
                                                                orderId:id,
                                                                lock: lock,
                                                                lager:"Weißenfelder Straße",
                                                                data:JSON.stringify(window.smartpackageReturn),
                                                                selectedPrinter: me.selectedPrinter
                                                            },
                                                            success: function(response){
                                                                var decodeddata = Ext.decode(response.responseText);
                                                                if(decodeddata.success === true){
                                                                    Ext.Msg.alert('Information', 'Labels & Rechnung wurden in den Druckprozess übergeben!');
                                                                    me.myMask.hide();
                                                                } else {
                                                                    if(decodeddata.message){
                                                                        Shopware.Notification.createGrowlMessage("Fehler",  decodeddata.message, "Kommissionierungsansicht");
                                                                    }else{
                                                                        Shopware.Notification.createGrowlMessage("Fehler", "Ein Fehler ist aufgetreten. (Rechnungspdfs und Ettiketten drucken)", "Kommissionierungsansicht");
                                                                    }
                                                                    me.myMask.hide();
                                                                }
                                                            }
                                                        });

                                                    },
                                                    icon: Ext.Msg.QUESTION
                                                });
                                            }else{

                                                Ext.Ajax.request({
                                                    url: '{url controller=Smartpackaging action=preparePrints}',
                                                    method:'POST',
                                                    cls:"createLabelBtn",
                                                    async:false,
                                                    params: {
                                                        orderId:id,
                                                        lock: lock,
                                                        lager:"Weißenfelder Straße",
                                                        data:JSON.stringify(window.smartpackageReturn),
                                                        user1: me.user1
                                                    },
                                                    success: function(response){
                                                        var decodeddata = Ext.decode(response.responseText);
                                                        if(decodeddata.success === true){
                                                            Ext.Msg.alert('Information', 'Labels & Rechnung wurden in den Druckprozess übergeben!');
                                                            me.myMask.hide();
                                                        } else {
                                                            if(decodeddata.message){
                                                                Shopware.Notification.createGrowlMessage("Fehler",  decodeddata.message, "Kommissionierungsansicht");
                                                            }else{
                                                                Shopware.Notification.createGrowlMessage("Fehler", "Ein Fehler ist aufgetreten. (Rechnungspdfs und Ettiketten drucken)", "Kommissionierungsansicht");
                                                            }
                                                            me.myMask.hide();
                                                        }
                                                    }
                                                });
                                            }
                                            //Ext.Msg.alert('Passed Status', me.selectedPrinter);
                                        } else {

                                            Ext.Msg.alert('Fehler', 'Ein Fehler bei der Berechnung der bestmöglichen Packung ist aufgetreten. Jo -.-');
                                            me.myMask.hide();
                                            window.smartpackageReturn = null;
                                            result = false;
                                        }
                                    }
                                });
                            } else {
                                me.myMask.hide();
                                Ext.Msg.alert('Achtung', 'Diese Bestellung ist nicht zur Kommissionierung freigegeben. Bitte im Büro anrufen, wenn sie dennoch bearbeitet werden soll.');
                            }
                        }
                    });
                }
            },
            sortable: false,
            renderer: function (p, v, r) {
                return  '<img alt="" style="cursor:pointer;" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAgACADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD90vjT8cPB37OXw21Lxj498T6H4P8AC2kIHvNU1e8S1toNzBVUu5ALMxVVUZZmYKoJIFfmt8Uv+C7Wm/8ABSn4a+LPh/8AsTfFrwX4T+N9neyW+k2/xB0ltPl8W2qIG8zRHnJg+0SMdscd1EXwsheKFQJg/wD4Odv+CkfjH/gnV4V+DF3oui+EPGvg7xpf6tpni/wd4p0mLUNI8T2aw2xWKZWXepQuzKVbbuI3rIo2H8ibj9gH9m7/AIK52D63+yT4mg+D3xonjae6+B3jbUx5GpTLCHddC1R8CbLLJtil+Y/O7C1iVRQB9N/sZf8ABzH+0F/wTI+Kn/CmP20/AvinxBb6M/kPq1zbi38U6dEAUSUlisGp25aP5Zt6s4Z5BPMNqn93v2Uf2zPhb+3H8L4vGXwm8b6H438PuwjknsJSJbOQjd5VxA4Wa3l2kHy5UR8EHGCDX4gaP4il/Zh/YVfwn/wVW1/wn4902Wx8/wCH/gGQf218V7Bnmz9oXUbedDa27CBhmeVvMwInmiEX2aT1P/g2p/4Kp3X7YX7bniz4V+Bfh14O+CvwF8GeBJ9S0PwZoVsk00t2t7p0Avr6/dRNdXRjaRS/yBg43iR1EhAKH/B714W1TUv2efgVq1vpuoXGlaXr2qRXt7FbO9tZvLBb+UksgG1GfY+0MQW2NjO04/Aj9lg7f2nvhxjj/iqNM5H/AF9xV/db4v8AB+k/ELwrqOha/pena5omsWz2d/p+oWyXNrewOpV4pYnBR0ZSQVYEEEgivx8/bn/4NJfBGufG/QPih+zjqVt4C1LSdctdX1HwbqcskmjXixzxSv8AY5sNJauQshEbCSIs6Kpt0WgD8av+DiSRpP8AgtP8fyxLH+3oRknPAsrYCvs3/gyb8LapP+318UtbTTNRfRbX4fyWM+orbObSG4k1GxeOF5cbFkdIpWVCdzLFIQCFbH3N8Qv+DW7Q/wBsX/gqP8UPjp8b/E32nwH4j1xL3SPB2hyyRXGpRRxQR5vrvCtCjeVIDFb/ADlZFYTxMCtfqX8EPgR4M/Zq+Gem+DfAHhfRPB/hbSEKWmmaTaJbW8WTlm2qBudmJZnbLOxLMSSTQB//2Q==" class="x-action-col-icon x-action-col-2  sprite-pencil " data-qtip="Rechnungen und Etiketten drucken" data-action="Rechnungen und Etiketten drucken">';//r.get('fastorderlogo');
            }
        }
    },

    getGridSelModel:function () {
        var me = this;

        var selModel = Ext.create('Ext.selection.CheckboxModel', {
            checkOnly: true,
            listeners:{
                // Unlocks the save button if the user has checked at least one checkbox
                selectionchange:function (sm, selections) {
                    if (me.createDocumentButton !== null) {
                        me.createDocumentButton.setDisabled(selections.length === 0);
                    }
                }
            }
        });
        return selModel;
    },

    getToolbar:function () {
        var me = this;

        return Ext.create('Ext.toolbar.Toolbar', {
            dock:'top',
            ui: 'shopware-ui',
            items:[
                '->',
                {
                    xtype:'textfield',
                    name:'searchfield',
                    cls:'searchfield',
                    width:175,
                    emptyText: me.snippets.toolbar.search,
                    enableKeyEvents:true,
                    checkChangeBuffer:500,
                    listeners: {
                        change: function(field, value) {
                            me.fireEvent('searchOrders', value);
                        }
                    }
                },
                { xtype:'tbspacer', width:6 }
            ]
        });
    },

    pickupDateColumn:function (value, metaData, record) {

        if (value != "") {
            return "<span style='color:red;' >"+value+ " - "+"15 Uhr"+"</span>";//value+' - ' + "15 Uhr";
        }
        return value;
    },

    dateColumn:function (value, metaData, record) {
        if ( value === Ext.undefined ) {
            return value;
        }
        return Ext.util.Format.date(value) + ' ' + Ext.util.Format.date(value, timeFormat);
    },

    dispatchColumn: function(value, metaData, record) {

        var dispatch = record.getDispatch().first();

        if (dispatch instanceof Ext.data.Model) {
            return dispatch.get('name');
        } else {
            return value;
        }
    },

    unlockColumn: function (value, metaData, record) {

        if (value ) {
            return '<img alt="Unlock Bestellung" style="cursor:pointer;" src="https://www.kunstloft.de/themes/Backend/ExtJs/backend/_resources/resources/themes/images/default/grid/refresh.gif">';
        }
    },

    customerColumn: function(value, metaData, record) {
        var me = this,
            name = '',
            billing = record.raw.customer,
            comments = [];

        if (billing) {
            if (billing.company) {
                name = billing.company;
            } else {
                name = Ext.String.trim(billing.firstname + ' ' + billing.lastname);
            }
        }

       /* var tpl = new Ext.XTemplate(
            '<div class="sprite-balloon customer-column-icon">',
            '</div>',
            '<p class="customer-column-text">' + name + '</p>'
        );

        if (record.get('customerComment').length > 0) {
            comments.push("<b>" + me.snippets.customerComment + "</b><br/>" + Ext.String.htmlEncode(record.get('customerComment')));
        }
        if (record.get('internalComment').length > 0) {
            comments.push("<b>" + me.snippets.internalComment + "</b><br/>" + Ext.String.htmlEncode(record.get('internalComment')));
        }
        if (record.get('comment').length > 0) {
            comments.push("<b>" + me.snippets.externalComment + "</b><br/>" + Ext.String.htmlEncode(record.get('comment')));
        }
        */
        if (comments.length > 0) {
            metaData.tdAttr = 'data-qtip="' + comments.join('<br/><br/>') + '"';
            return tpl.html;
        } else {
            return name;
        }

    }

});
