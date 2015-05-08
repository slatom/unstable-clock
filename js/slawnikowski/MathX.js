define(['jquery'], function($ ){

	var MathX = {


		range: function range( v, min, max )
		{
			return Math.max( min, Math.min(v, max) );
		},


		degToRad: function degToRad( deg ) 
		{
			return deg * Math.PI / 180;
		}

		
	}


	return MathX;
});