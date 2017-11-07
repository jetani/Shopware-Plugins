/**
 *
 */
Ext.define('Shopware.apps.Order.store.PositionHistory', {
    extend:'Shopware.store.Listing',
    /**
     * Auto load the store after the component is initialized
     * @boolean
     */
    autoLoad:false,
    /**
     * Enable remote sort.
     * @boolean
     */
    remoteSort:true,
    /**
     * Enable remote filtering
     * @boolean
     */
    remoteFilter:true,
    /**
     * Amount of data loaded at once
     * @integer
     */
    pageSize:20,
    /**
     * to upload all selected items in one request
     * @boolean
     */
    batch:true,
    configure: function() {
        return {
            controller: 'PositionStatusHistory'
        };
    },
    model:'Shopware.apps.Order.model.PositionHistory'
})