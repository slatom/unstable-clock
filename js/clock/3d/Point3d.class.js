define(
	['jquery'],
	function( $ ){


	function Point3d(x, y, z)
	{
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
	}
	
	Point3d.prototype.setPosition = function( x, y, z ) 
	{
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
	}
	
	Point3d.prototype.translate = function( x, y, z )
	{
		this.x += x;
		this.y += y;
		this.z += z;
	}


	return Point3d;
});