/*!
 * Exp 1 - Clock
 * Copyright 2015 Tomasz Slawnikowski
 *
 * Authors: Tomasz Slawnikowski http://freelance-html-developer.com/
 */


define(
['jquery', 'ticktack', 'clock/Clock3d.class', 'buzz'],
function($, ticktack, Clock3d, Buzz ){


	var isTouch;

	var clock3d;


	function initPage()
	{
		isTouch = !!('ontouchstart' in window);

		this.mySound = new Buzz.sound( "./mp3/ping", {
		    formats: [ "mp3" ],
		    volume: 20,
		    preload: true,
		    autoplay: false,
		    loop: false

		});


		ticktack.on('second', function(o){
			onTick(o);
  		});

  		clock3d = new Clock3d();
               
	}

	function onTick(o)
	{
		var h = addZeros( o.getHour().value );
		var m = addZeros( o.getMinute().value );
		var s = addZeros( o.getSecond().value );

		$( "#clockhmid" ).text( h + ":" + m + ":" + s );
		
		//$( "#clocksid" ).text( s );
		$( "#clocksid" ).text( '' );

		clock3d.setTime( s );

		this.mySound.stop().play();
	}


	function addZeros(v)
	{
		if(v<10)
		{
			return "0"+v;
		}

		return v;
	}



	var page = {};
	page.init = function(element) {
		this.element = $(element);
		initPage();
	};

	return page;

});


