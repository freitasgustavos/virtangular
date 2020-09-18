'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
    beforeEach(module('myApp.controllers'));


    it('should test MainCtrl', inject(function($controller) {
        //spec body
        var scope = {},
            ctrl = $controller('MainCtrl', {$scope:scope});

        expect('aaaa').toBe('aaaa');
    }));


});