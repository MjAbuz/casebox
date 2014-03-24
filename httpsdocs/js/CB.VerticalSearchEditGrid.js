Ext.namespace('CB');

CB.VerticalSearchEditGrid = Ext.extend(CB.VerticalEditGrid, {

    initComponent: function() {
        this.initRenderers = this.initRenderers.createSequence(this.newInitRenderers, this);
        this.initColumns = this.initColumns.createSequence(this.newInitColumns, this);

        this.oldOnBeforeEditProperty = this.onBeforeEditProperty;
        this.onBeforeEditProperty = this.newOnBeforeEditProperty;

        Ext.apply(this, {
            stateId: Ext.value(this.stateId, 'vseg')
        });

        CB.VerticalSearchEditGrid.superclass.initComponent.apply(this, arguments);
    }

    ,newInitRenderers: function () {
        this.renderers.condition = function(v, meta, record, row_idx, col_idx, store){
            var st = this.getConditionsStore(record.get('type'));
            var idx = st.findExact('id', v);
            if(idx >= 0) {
                return st.getAt(idx).get('name');
            }
            return '';
        }.createDelegate(this);
    }

    ,newInitColumns: function() {

        this.gridColumns.splice(
            1
            ,0
            ,{
                header: L.Condition
                ,width: 50
                ,dataIndex: 'cond'
                ,resizable: false
                ,editable: true
                ,scope: this
                ,renderer: this.renderers.condition
            }
        );

    }

    //grid, record, field, value, row, column, cancel
    ,newOnBeforeEditProperty: function(e){
        if(e.field != 'cond') {
            return this.oldOnBeforeEditProperty(e);
        }

        if(e.record.get('type') == 'H') {
            e.cancel = true;
            return;
        }

        var ed = new Ext.form.ComboBox({
            enableKeyEvents: true
            ,forceSelection: true
            ,triggerAction: 'all'
            ,lazyRender: true
            ,mode: 'local'
            ,displayField: 'name'
            ,valueField: 'id'
            ,store: this.getConditionsStore(e.record.get('type'))
        });
        this.attachKeyListeners(ed);

        var col = e.grid.colModel.getColumnAt(e.column);
        col.setEditor(new Ext.grid.GridEditor(ed));
    }

    ,getConditionsStore: function(type) {
        var cond = [];
        switch(type) {
            case 'H':
                break;
            case 'int':
            case 'float':
            case 'date':
            case 'datetime':
                cond = [
                    {id: '=', name: '='}
                    ,{id: '<=', name: '<='}
                    ,{id: '>=', name: '>='}
                    ,{id: '!=', name: '!='}
                ];
                // custom value formats (date1 .. date2, )
                break;

            case '_objects':
            case 'combo':
            case 'iconcombo':
            case 'timeunits':
            case '_sex':
                cond = [
                    {id: '<=', name: 'contains any'}
                    ,{id: '>=', name: 'contains all'}
                    ,{id: '=', name: 'equal'}
                    ,{id: '!=', name: 'not equal'}
                ];
                //= (exact match), contains any, contains all, does not contain any, does not contain all
                break;

            case '_auto_title':
            case 'varchar':
            case 'text':
            case 'memo':
            case 'html':
                cond = [
                    {id: 'contain', name: 'contain'}
                    ,{id: 'start', name: 'start with'}
                    ,{id: 'end', name: 'end with'}
                    ,{id: 'not', name: 'does not contain'}
                    ,{id: '=', name: 'equal'}
                    ,{id: '!=', name: 'not equal'}
                ];
                break;

            case 'checkbox':
                cond = [
                    {id: '=', name: 'is'}
                    ,{id: '!=', name: 'is not'}
                ];
                break;

        }

        return new Ext.data.JsonStore({
            autoLoad: true
            ,autoDestroy: true
            ,fields: ['id', 'name']
            ,data: cond
        });
    }
});

Ext.reg('CBVerticalSearchEditGrid', CB.VerticalSearchEditGrid);
