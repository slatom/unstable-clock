/*!
 * Exp 1 - Clock
 * Copyright 2015 Tomasz Slawnikowski
 *
 * Authors: Tomasz Slawnikowski http://freelance-html-developer.com/
 */

requirejs.config({
	paths: {
		jquery: 'vendor/jquery-2.1.3',
		threejs: 'vendor/three.min',
		requestAnimationFrame: 'vendor/requestAnimationFrame',
		ticktack: 'meodai/ticktack',
		orbitcontrols: 'vendor/OrbitControls',
		mathx: 'slawnikowski/MathX',
		buzz: 'vendor/buzz.min'
	},

	shim: {
		'jquery': { exports: 'jQuery' },
		'threejs': { exports: 'THREE' },
		'orbitcontrols': { exports: 'OrbitControls' },
		'ticktack': { deps: ['requestAnimationFrame', 'jquery'] },
		'orbitcontrols': { deps: ['threejs'] }
	}
});

require( ['jquery'], function( $ ){

	if (typeof console == "undefined" || typeof console.log == "undefined") var console = { log: function() {} }; 

	$(function(){
	
		var $body = $('body');
		require(['clock/clock'], function(page){
			page.init($body);
		});

	});

});


