/* MODEL */
Ext.define('repoModel', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'name', type: 'string'},
        {name: 'login', type: 'string',mapping:'owner.login'},
        {name: 'avatar_url', type: 'string',mapping:'owner.avatar_url'},
        {name: 'watchers', type: 'int'},
        {name: 'forks', type: 'int'},
        {name: 'open_issues_count', type: 'int'},
        {name: 'created_at', type: 'date'},
        {name: 'updated_at', type: 'date'},
        {name: 'description', type: 'string'},
        {name: 'type', type: 'string',mapping:'owner.type'},

        
        

    ]
});

/* STORE */

var RepoDS = Ext.create('Ext.data.Store', {
    model: 'repoModel',
    autoLoad: false,
    pageSize: 50,
    proxy : {
        
        type : 'ajax',
         url : 'https://api.github.com/search/repositories?q={query}{&page,per_page,sort,order}',
        method : 'GET',
        // extraParams : {
        //      module: '',
        //      action: 'list',
        // },
        reader: {
            type: 'json',
            root: 'items', 
            successProperty: 'success', 
            totalProperty: 'rows', 
            messageProperty: 'message',
        },
        enablePaging: true,
    },
    listeners: {
        beforeload: function (store) {
            var form = Ext.ComponentQuery.query('#filterform')[0].getForm(),
            params = form.getValues();
            if(Ext.ComponentQuery.query('#keyword')[0].getValue()!=""){
                params.q = Ext.ComponentQuery.query('#keyword')[0].getValue();
            }
            Ext.merge(store.proxy.extraParams, params);
        },
        load: function (store, rec, success) {
             if (!success) {
                if (store && (store instanceof Ext.data.Store)) {
                    var resp = store.proxy.reader.rawData;
                    if (resp && resp.msg) {
                        Ext.Msg.alert('ERROR', resp.msg);
                    } else {
                        Ext.Msg.alert('ERROR', 'Respon server error, cek console / network');
                       // console.log(Ext.encode(store.proxy.reader.rawData));
                    }
                }
            }
        }
    },
});


Ext.application({
name: 'Repository App',
launch: function() {
    Ext.create('Ext.container.Viewport', {
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [
            {
                xtype: 'panel',
                collapsed: false,
                title: 'Repository',
                layout  : {
                    align : 'stretch',
                    type  : 'vbox'
                },
                tools: [
                    {
                        xtype: 'textfield',
                        itemId: 'keyword',
                        emptyText: 'Keyword',
                        margin: '0 10 0 0',
                        enableKeyEvents: true,
                        listeners: {
                            keypress: function (textfield, eo) {
                                if (eo.getCharCode() == Ext.EventObject.ENTER) {
                                    RepoDS.loadPage(1);
                                }
                            }
                        },
                    },
                    {
                        xtype: 'button',
                        iconCls: 'fas fa-search',
                        tooltip: 'Cari',
                        handler: function () {
                            RepoDS.loadPage(1);
                        }
                    },
                    {
                        xtype: 'button',
                        iconCls: 'fas fa-broom',
                        tooltip: 'Bersihkan',
                        handler: function () {
                            var form = this.up('panel').down('form').getForm();
                            form.reset();

                            var keyword = Ext.ComponentQuery.query('#keyword')[0];
                            keyword.setValue('');

                            RepoDS.loadPage(1);
                        }
                    },
                    {
                        xtype: 'button',
                        iconCls: 'fas fa-filter',
                        tooltip: 'Pencarian Lanjut',
                        id: 'toogle',
                        handler: function() {
                            var panel = this.up('panel'),
                                state = panel.getCollapsed();
                            if (state) {
                                panel.expand();
                            } else {
                                panel.collapse()
                            }
                        }
                    }
                ],
                items: [
                    {
                        xtype: 'form',
                        itemId: 'filterform',
                        bodyPadding: '10',
                        items: [
                            // {
                            //     xtype: 'combo',
                            //     name: 'gender',
                            //     store: genderDS,
                            //     fieldLabel: 'Jenis Kelamin',
                            //     valueField: 'id',
                            //     displayField: 'name',
                            //     forceSelection: true,
                            //     listeners: {
                            //         change: function (cmp, newValue, oldValue, eOpts) {
                            //             RepoDS.loadPage(1);
                            //         }
                            //     }
                            // }
                        ]
                    }
                ]
            },
            {
                xtype: 'gridpanel',
                store: RepoDS,
                flex: 1,
                // plugins:[
                //     {
                //         ptype: 'rowediting',
                //         clicksToMoveEditor: 1,
                //         listeners: {
                //             'edit': function (editor, context) {
                //                 // case ubah data di baris row klik Update langsung simpan ke database
                //                 console.log('logic save data kirim ke server api');
                                
                //                 console.log(editor);
                //                 console.log(context);

                //                 console.log('baris data yang diubah');
                //                 console.log(context.record.data);
                //             }
                //         }
                //     }
                // ],
                columns: [
                    {
                      xtype: 'rownumberer',
                      header: 'No',
                      menuDisabled: true,
                      style: 'text-align:center',
                      align: 'center',
                      width: 50,
                    },
                    {
                      xtype: 'actioncolumn',
                      header: 'Action',
                      menuDisabled: true,
                      style: 'text-align:center',
                      align: 'center',
                      width: 60,
                      items: [
                        {   
                            iconCls: 'icon-edit space',
                            tooltip: 'Detail',
                            handler: function(gridview, rowIndex, colIndex, actionItem, event, record, row) {
                                var myImage = Ext.create('Ext.Img', {
                                src:record.data.avatar_url,
                                });
                                picWin = Ext.create('Ext.window.Window', {
                                    title: record.data.login,
                                    width: '20%',
                                    height: '60%',
                                    maximizable: true,
                                    layout  : {
                                        align : 'stretch',
                                        type  : 'vbox'
                                    },
                                    items: [
                                        
                                        myImage,
                                      
                                            // {
                                            //     xtype: 'textfield',
                                            //     margin:'30 0 0 0',
                                            //     name: 'login',
                                            //     flex: 1,
                                            //     fieldLabel: 'Author Name',
                                            //     readOnly:true,
                                            //     value:record.data.login
                                                
                                            // },
                                            // {
                                            //     xtype: 'datefield',
                                            //     name: 'created_at',
                                            //     flex: 1,
                                            //     fieldLabel: 'Created at',
                                            //     readOnly:true,
                                            //     value:record.data.created_at,
                                                
                                            // },
                                            // {
                                            //     xtype: 'component',
                                            //     autoEl: {
                                            //         tag: 'a',
                                            //        href: 'https://api.github.com/repos/'+record.data.login+'/'+record.data.name,
                                            //         html: 'Repository Detail',
                                            //         target:"_blank",
                                                    
                                            //         }
                                            
                                            // },
                                            {
                                                xtype: 'label',
                                                forId: 'myFieldId',
                                                html: '<a href="">Repository Detail</a>',
                                                margin: '0 0 0 10',
                                                listeners: {
                                                    click: {
                                                        element: 'el',
                                                        preventDefault: true,
                                                        fn: function(e, target){
                                                            var el = Ext.fly(target);
                                                            if(el.dom.nodeName === "A"){
                                                                console.log('Clicked');
                                                                    UserWin = Ext.create('Ext.window.Window', {
                                                                        title: "Repository Detail",
                                                                        width: '80%',
                                                                        height: '60%',
                                                                        //maximizable: true,
                                                                        layout  : {
                                                                            align : 'stretch',
                                                                            type  : 'vbox'
                                                                        },
                                                                       
                                                                        items: [
                                                                          
                                                                                {
                                                                                    xtype: 'textfield',
                                                                                    margin:'30 30 30 30',
                                                                                    name: 'login',
                                                                                    flex: 1,
                                                                                    fieldLabel: 'Author Name',
                                                                                    readOnly:true,
                                                                                    value:record.data.login,
                                                                                },
                                                                                
                                                                                {
                                                                                    xtype: 'textfield',
                                                                                    name: 'description',
                                                                                    margin:'30 30 30 30',
                                                                                    flex: 1,
                                                                                    fieldLabel: 'Description',
                                                                                    readOnly:true,
                                                                                    value:record.data.description,
                                                                                    
                                                                                },
                                                                                {
                                                                                    xtype: 'datefield',
                                                                                    name: 'created_at',
                                                                                    margin:'30 30 30 30',
                                                                                    flex: 1,
                                                                                    fieldLabel: 'Created at',
                                                                                    readOnly:true,
                                                                                    value:record.data.created_at,
                                                                                    
                                                                                },
                                                                        
                                                                        ]
                                                                    
                                                                    
                                                                    
                                                                    })
                                                                    UserWin.show();
                                                            }
                                                        }
                                                    }
                                                }

                                            },
                                            {
                                                xtype: 'label',
                                                forId: 'myFieldId',
                                                html: '<a href="">User Detail</a>',
                                                margin: '0 0 0 10',
                                                listeners: {
                                                    click: {
                                                        element: 'el',
                                                        preventDefault: true,
                                                        fn: function(e, target){
                                                            var el = Ext.fly(target);
                                                            if(el.dom.nodeName === "A"){
                                                                console.log('Clicked');
                                                                    UserWin = Ext.create('Ext.window.Window', {
                                                                        title: "User Detail",
                                                                        width: '80%',
                                                                        height: '60%',
                                                                        maximizable: true,
                                                                        layout  : {
                                                                            align : 'stretch',
                                                                            type  : 'vbox'
                                                                        },
                                                                        items: [
                                                                          
                                                                                {
                                                                                    xtype: 'textfield',
                                                                                    margin:'30 30 30 30',
                                                                                    name: 'name',
                                                                                    flex: 1,
                                                                                    fieldLabel: 'Name',
                                                                                    readOnly:true,
                                                                                    value:record.data.login
                                                                                    
                                                                                },
                                                                                {
                                                                                    xtype: 'textfield',
                                                                                    margin:'30 30 30 30',
                                                                                    name: 'type',
                                                                                    flex: 1,
                                                                                    fieldLabel: 'Type',
                                                                                    readOnly:true,
                                                                                    value:record.data.type,
                                                                                    
                                                                                },
                                                                        
                                                                        ]
                                                                    })
                                                                    UserWin.show();
                                                            }
                                                        }
                                                    }
                                                }

                                            },
                                    
                                    ]
                                })
                                picWin.show();
                           
                            },
                        },
                      ]
                    },
                    {
                        header: 'ID',
                        dataIndex: 'id',
                        width: 110,
                        hidden:true,
                    },
                
                    {
                        header: 'Repository Name',
                        dataIndex: 'name',
                        flex: 1,
                        editor: {
                            xtype: 'textfield'
                        },
                    },
                    {
                        header: 'created at',
                        dataIndex: 'created_at',
                        flex: 1,
                        editor: {
                            xtype: 'datefield'
                        },
                        hidden:true
                    },
                    {
                        header: 'updated at',
                        dataIndex: 'updated_at',
                        flex: 1,
                        editor: {
                            xtype: 'datefield'
                        },
                        hidden:true
                    },
                    {
                        header: 'type',
                        dataIndex: 'type',
                        flex: 1,
                        hidden:true
                    },
                    {
                        header: 'Description',
                        dataIndex: 'description',
                        flex: 1,
                        hidden:true
                    },
                    
                    {
                        header: 'Author Name',
                        dataIndex: 'login',
                        flex: 1,
                        editor: {
                            xtype: 'textfield'
                        },
                    },
                    {
                        header: 'Avatar Url',
                        dataIndex: 'avatar_url',
                        align: 'center',
                        editor: {
                            xtype: 'textfield'
                        },
                        renderer: function(value, metadata, record) {//debugger;
                          //  return Ext.String.format('{0} <img height="20" width="20" src="{1}"></img>', value, record.data.image);
                          //return   record.get( 'avatar_url' ) + "<img src='"+value+"' />";
                          return '<img height="20" width="20" src="'+value+'"/>';

                        },
                    },
                    {
                        header: 'Watchers',
                        dataIndex: 'watchers',
                        align: 'center',
                        flex: 1,
                        editor: {
                            xtype: 'textfield'
                        },
                    },
                    {
                        header: 'forks',
                        dataIndex: 'forks',
                        align: 'center',
                        flex: 1,
                        editor: {
                            xtype: 'textfield'
                        },
                    },
                    {
                        header: 'Issues',
                        dataIndex: 'open_issues_count',
                        align: 'center',
                        flex: 1,
                        editor: {
                            xtype: 'textfield'
                        },
                    },
                 
                ],
                bbar: {
                    xtype: 'pagingtoolbar',
                    displayInfo: true,
                    store: RepoDS,
                },
                listeners: {
                    afterrender: function () {
                        RepoDS.loadPage(1);
                    }
                },
                
            }
        ]
    });
}
});