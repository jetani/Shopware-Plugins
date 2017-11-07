/**
 *
 */
//{namespace name=backend/BestellungenNeuLager/view/ager}

Ext.define('Shopware.apps.BestellungenNeuLager.view.main.Window', {
    /**
     * Define that the order main window is an extension of the enlight application window
     * @string
     */
    extend:'Enlight.app.Window',
    /**
     * Set base css class prefix and module individual css class for css styling
     * @string
     */
    cls:Ext.baseCSSPrefix + 'bestellungen-neu-lager-window',
    /**
     * List of short aliases for class names. Most useful for defining xtypes for widgets.
     * @string
     */
    alias:'widget.bestellungen-neu-lager-window',
    /**
     * Set no border for the window
     * @boolean
     */
    border:false,
    /**
     * True to automatically show the component upon creation.
     * @boolean
     */
    autoShow:true,
    /**
     * Set border layout for the window
     * @string
     */
    layout:'border',
    /**
     * Define window width
     * @integer
     */
    width:1000,
    /**
     * Define window height
     * @integer
     */
    height:'90%',
    /**
     * True to display the 'maximize' tool button and allow the user to maximize the window, false to hide the button and disallow maximizing the window.
     * @boolean
     */
    maximizable:true,
    /**
     * True to display the 'minimize' tool button and allow the user to minimize the window, false to hide the button and disallow minimizing the window.
     * @boolean
     */
    minimizable:true,
    /**
     * Set window title which is displayed in the window header
     * @string
     */
    //title:'{s name=neuLager/window_title}Kommissionierung Weißenfelder Straße (Klausnerring: [0] weitere Bestellungen){/s}',


    /**
	 * @return void
     */
   initComponent:function () {
        var me = this;

        me.items = Ext.create('Shopware.apps.BestellungenNeuLager.view.list.List', {
                      bestellungenLagerStore: me.bestellungenLagerStore
                  });
        me.callParent(arguments);
    }
});

