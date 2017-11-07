/**
 *
 */
//{namespace name=backend/order/view/positionhistory}
Ext.define('Shopware.apps.Order.view.detail.PositionHistory', {
    extend:'Ext.grid.Panel',

    /**
     * List of short aliases for class names. Most useful for defining xtypes for widgets.
     * @string
     */
    alias:'widget.position-history-list',

    /**
     * Set css class
     * @string
     */
    cls:Ext.baseCSSPrefix + 'position-history-list',

    /**
     * The window uses a boffer layout, so we need to set
     * a region for the grid panel
     * @string
     */
    region:'center',

    /**
     * The view needs to be scrollable
     * @string
     */
    autoScroll:true,

    /**
     * Contains all snippets for the view component
     * @object
     */
    snippets:{
        columns: {
            position: '{s name=column/position}Article Number{/s}',
            user: '{s name=column/user}User{/s}',
            changeDate: '{s name=column/change_date}Change date{/s}',
            previousPositionStatus: '{s name=column/previous_position_status}Previous position status{/s}',
            positionStatus: '{s name=column/position_status}Current position status{/s}'
        }
    },

    initComponent:function () {
        var me = this;

        me.store = me.positionHistoryStore;
        me.columns = {
            items: me.getColumns(),
            defaults: { flex: 1 }
        }
        me.pagingbar = me.getPagingBar();
        me.dockedItems = [  me.pagingbar ];
        me.callParent(arguments);
    },


    /**
     * @return Ext.toolbar.Paging The paging toolbar for the customer grid
     */
    getPagingBar:function () {
        var me = this;

        return Ext.create('Ext.toolbar.Paging', {
            store: me.positionHistoryStore,
            dock:'bottom',
            displayInfo:true
        });

    },

    /**
     * @event select
     * @param [object] combo - Ext.form.field.ComboBox
     * @param [array] records - Array of selected entries
     * @return void
     */
    onPageSizeChange: function(combo, records) {
        var record = records[0],
            me = this;

        me.positionHistoryStore.pageSize = record.get('value');
        me.positionHistoryStore.loadPage(1);
    },

    /**
     * Creates the grid columns
     *
     * @return [array] grid columns
     */
    getColumns:function () {
        var me = this;

        var columns = [
        {
            header: me.snippets.columns.position,
            dataIndex: 'articleNumber',
            renderer: me.positionColumn
        },
        {
            header: me.snippets.columns.user,
            dataIndex: 'userName'
        }, {
            header: me.snippets.columns.changeDate,
            dataIndex: 'changeDate',
            renderer: me.changeDateColumn
        }, {
            header: me.snippets.columns.previousPositionStatus,
            dataIndex: 'prevPositionStatus'
        }, {
            header: me.snippets.columns.positionStatus,
            dataIndex: 'currentPositionStatus'
        }];

        return columns;
    }

});
