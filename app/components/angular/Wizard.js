'use strict';

angular

    .module('newApp')

    .factory('Wizard', function($rootScope) {

        var _factory   = {};

        _factory.loadWizards = {
            
            initialize: function(mod) {

                if(window.localStorage.getItem('wizard') === 'undefined') return;
                
                var jsonWizard = JSON.parse(window.localStorage.getItem('wizard'));
                var crrWizard = null;

                if(jsonWizard == null) return;

                console.log("Json from server", jsonWizard);

                for(var keyName in jsonWizard){
                    if(keyName == mod) {
                        crrWizard = jsonWizard[keyName];
                        if(crrWizard[0].status === 1)
                            crrWizard = null;
                    }
                }

                if(crrWizard == null) return;

                var arrWizard = [];
                for(var i=0; i<crrWizard.length; i++){
                    arrWizard.push({
                        id: crrWizard[i].codigo,
                        wizid: crrWizard[i].wizid_,
                        complete: false,
                        mod: mod,
                        steps: JSON.parse(crrWizard[0].passos)
                    });
                }

                $rootScope.setWizard(arrWizard[0]);
            }
        };
        
        return _factory;
    });
