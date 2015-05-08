'use strict';


define (
	['jquery', 'threejs', 'mathx'],
	function( $, THREE, MathX ){


	var DOTS_PER_LINE = 28;

	var POS_RANDOM = .6;
	var POS_Z_RANDOM = 1.1;
	var POS_L_RANDOM = .9;

	var MIN_DISTANCE = .4;

	var MAX_CONNECTION = 10;

	var SIZE = 1.5;

	var DELAY = 0.03;

	var VELOCITY = 0.001;


	var p0 = new THREE.Vector3( 0, 0, 0 );
	var	p1 = new THREE.Vector3( -SIZE, 0, 0 );
	var	p2 = new THREE.Vector3( 0, -SIZE, 0 );
	var	p3 = new THREE.Vector3( -SIZE, -SIZE, 0 );
	var	p4 = new THREE.Vector3( 0, -2*SIZE, 0 );
	var	p5 = new THREE.Vector3( -SIZE, -2*SIZE, 0 );

	var p = [ p0, p1, p2, p3, p4, p5 ];

	var	l0 = [ 0, 1 ];
	var	l1 = [ 0, 2 ];
	var	l2 = [ 1, 3 ];
	var	l3 = [ 2, 3 ];
	var	l4 = [ 2, 4 ];
	var	l5 = [ 3, 5 ];
	var	l6 = [ 4, 5 ];

	var	l = [ l0, l1, l2, l3, l4, l5, l6 ];

	var	d0 = [1, 1, 1, 0, 1, 1, 1];
	var	d1 = [0, 0, 1, 0, 0, 1, 0];
	var	d2 = [1, 0, 1, 1, 1, 0, 1];
	var	d3 = [1, 0, 1, 1, 0, 1, 1];
	var	d4 = [0, 1, 1, 1, 0, 1, 0];
	var	d5 = [1, 1, 0, 1, 0, 1, 1];
	var	d6 = [1, 1, 0, 1, 1, 1, 1];
	var	d7 = [1, 0, 1, 0, 0, 1, 0];
	var	d8 = [1, 1, 1, 1, 1, 1, 1];
	var	d9 = [1, 1, 1, 1, 0, 1, 1];

	var	d = [ d0, d1, d2, d3, d4, d5, d6, d7, d8, d9 ];


	//check connections only between neighbour segments
	//		 [1, 2, 3, 4, 5, 6, 7]
	var	n0 = [1, 1, 1, 0, 0, 0, 0];
	var	n1 = [1, 1, 0, 1, 1, 0, 0];
	var	n2 = [1, 0, 1, 1, 0, 1, 0];
	var	n3 = [0, 1, 1, 1, 1, 1, 0];
	var	n4 = [0, 1, 0, 1, 1, 0, 1];
	var	n5 = [0, 0, 1, 1, 0, 1, 1];
	var	n6 = [0, 0, 0, 0, 1, 1, 1];

	var	n = [ n0, n1, n2, n3, n4, n5, n6 ];



	var POINTS_NO = l.length * DOTS_PER_LINE;



	function Digit( scene ) 
	{

		this.scene = scene;

		this.currentDigit;
		this.particlesData = [];
		this.pointsGeo;
		this.connectionsGeo;
		this.pCloud;
		this.pPositions;
		this.linesMesh;


		this.group = new THREE.Group();
		this.scene.add( this.group );

		this.group.rotation.y = MathX.degToRad( 180 );

		var maxConnectionsNo  = ( l.length * DOTS_PER_LINE ) * MAX_CONNECTION;

		this.positions = new Float32Array( maxConnectionsNo * 3 );
		this.colors = new Float32Array( maxConnectionsNo * 3 );
		

		this.createDots();

		this.createConnections();
		this.checkConnections();
	}
	

	
	Digit.prototype.createDots = function() 
	{	

		var pMaterial = new THREE.PointCloudMaterial( {
			color: 0xFFFFFF,
			size: .4,
			sizeAttenuation: false
		} );

		
		this.pointsGeo = new THREE.BufferGeometry();
		this.pPositions = new Float32Array( POINTS_NO * 3 );


		var i, j, p1, p2, rx, ry, rz, lineType;
		for( i=0; i<l.length; i++ )
		{
			p1 = p[ l[i][0] ];
			p2 = p[ l[i][1] ];

			if( p1.x == p2.x ) lineType = "v";
			else lineType = "h";
			
			for( j=0; j<DOTS_PER_LINE; j++ )
			{
				if( lineType == "h")
				{
					rx = Math.random()*(p2.x-p1.x)+p1.x;
					ry = p1.y + (Math.random()-.5) * POS_RANDOM;
					rz = p1.z + (Math.random()-.5) * POS_Z_RANDOM;
				}
				else
				{
					rx = p1.x + (Math.random()-.5) * POS_RANDOM;
					ry = Math.random()*(p2.y-p1.y)+p1.y;
					rz = p1.z + (Math.random()-.5) * POS_Z_RANDOM;
				}

				var pos = i*DOTS_PER_LINE;
				this.pPositions[ (pos+j) * 3     ] = rx;
				this.pPositions[ (pos+j) * 3 + 1 ] = ry;
				this.pPositions[ (pos+j) * 3 + 2 ] = rz;

				var targetPosition = new THREE.Vector3( rx, ry, rz);

				this.particlesData.push( {
					segment: i, 
					isEnabled: true,
					lineType: lineType,
					targetPosition: targetPosition,
					velocity: new THREE.Vector3( (-1 + Math.random() * 2)*VELOCITY, 
						(-1 + Math.random() * 2)*VELOCITY, 
						(-1 + Math.random() * 2)*VELOCITY ),
					numConnections: 0
				} );
			}
		}

		this.pointsGeo.addAttribute( 'position', new THREE.DynamicBufferAttribute( this.pPositions, 3 ) );

		this.pCloud = new THREE.PointCloud( this.pointsGeo, pMaterial );
		this.group.add( this.pCloud );
	}



	Digit.prototype.findRandomDotsPositions = function()
	{
		var i, d, tPos, targetPosition, rx, ry, rz;
		for ( i = 0; i < POINTS_NO; i++ )
		{
			d = this.particlesData[ i ];
			tPos = d.targetPosition;

			p1 = p[ l[d.segment][0] ];
			p2 = p[ l[d.segment][1] ];

			if( d.lineType == "h")
			{
				tPos.x = MathX.range( tPos.x, p2.x, p1.x );
				if( tPos.x == p2.x )
				{
					rx = tPos.x + Math.random() * POS_L_RANDOM;
				}
				else if( tPos.x == p1.x )
				{
					rx = tPos.x - Math.random() * POS_L_RANDOM;
				}
				else
				{
					rx = tPos.x + (Math.random()-.5) * POS_L_RANDOM;
					rx = MathX.range( rx, p2.x, p1.x );
				}

				ry = p1.y + (Math.random()-.5) * POS_RANDOM;
				rz = p1.z + (Math.random()-.5) * POS_Z_RANDOM;
			}
			else
			{
				tPos.y = MathX.range( tPos.y, p2.y, p1.y );
				if( tPos.y == p2.y )
				{
					ry = tPos.y + Math.random() * POS_L_RANDOM;
				}
				else if( tPos.y == p1.y )
				{
					ry = tPos.y - Math.random() * POS_L_RANDOM
				}
				else
				{
					ry = tPos.y + (Math.random()-.5) * POS_L_RANDOM;
					ry = MathX.range( ry, p2.y, p1.y );
				}

				rx = p1.x + (Math.random()-.5) * POS_RANDOM;					
				rz = p1.z + (Math.random()-.5) * POS_Z_RANDOM;
			}

			targetPosition = new THREE.Vector3( rx, ry, rz);

			if( d.isEnabled == true )
				d.targetPosition = targetPosition;
		}
	}



	Digit.prototype.moveDots = function() 
	{
		var tPos, i;
		for ( i = 0; i < POINTS_NO; i++ )
		{
			tPos = this.particlesData[i].targetPosition;
			this.pPositions[ i * 3     ] += ( tPos.x - this.pPositions[ i * 3 ] )*DELAY;
			this.pPositions[ i * 3 + 1 ] += ( tPos.y - this.pPositions[ i * 3 + 1 ] )*DELAY;
			this.pPositions[ i * 3 + 2 ] += ( tPos.z - this.pPositions[ i * 3 + 2 ] )*DELAY;		
		}
	}



	Digit.prototype.createConnections = function() 
	{

		this.connectionsGeo = new THREE.BufferGeometry();

		this.connectionsGeo.addAttribute( 'position', new THREE.DynamicBufferAttribute( this.positions, 3 ) );
		this.connectionsGeo.addAttribute( 'color', new THREE.DynamicBufferAttribute( this.colors, 3 ) );

		this.connectionsGeo.computeBoundingSphere();

		this.connectionsGeo.drawcalls.push( {
			start: 0,
			count: 0,
			index: 0
		} );

		var material = new THREE.LineBasicMaterial( {
			vertexColors: THREE.VertexColors,
			blending: THREE.AdditiveBlending,
			transparent: true
		} );

		this.linesMesh = new THREE.Line( this.connectionsGeo, material, THREE.LinePieces );
		this.group.add( this.linesMesh );

	}


	Digit.prototype.checkConnections = function() {

		var vertexpos = 0;
		var colorpos = 0;
		var numConnected = 0;

		var i;
		for ( i = 0; i < POINTS_NO; i++ )
			this.particlesData[ i ].numConnections = 0;

		var j, particleData, particleDataB;
		var dx, dy, dz, dist;
		for ( i = 0; i < POINTS_NO; i++ ) {

			particleData = this.particlesData[i];


			particleData.targetPosition.x += particleData.velocity.x;
			particleData.targetPosition.y += particleData.velocity.y;
			particleData.targetPosition.z += particleData.velocity.z;
			

			if ( particleData.numConnections >= MAX_CONNECTION )
				continue;

			for ( j = i + 1; j < POINTS_NO; j++ ) {

				particleDataB = this.particlesData[ j ];
				if (  particleData.numConnections >= MAX_CONNECTION || particleDataB.numConnections >= MAX_CONNECTION )
					continue;

				if( n[ particleData.segment ][ particleDataB.segment ] == 0 ) continue;

				dx = this.pPositions[ i * 3     ] - this.pPositions[ j * 3     ];
				dy = this.pPositions[ i * 3 + 1 ] - this.pPositions[ j * 3 + 1 ];
				dz = this.pPositions[ i * 3 + 2 ] - this.pPositions[ j * 3 + 2 ];
				dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

				if ( dist < MIN_DISTANCE ) {

					particleData.numConnections++;
					particleDataB.numConnections++;

					var alpha = (1.0 - dist / MIN_DISTANCE)*.9;

					//check if is Enabled
					if( !particleData.isEnabled || !particleDataB.isEnabled )
					{
						var alpha = alpha *.12;
					}
						
					this.colors[ colorpos++ ] = alpha;
					this.colors[ colorpos++ ] = alpha;
					this.colors[ colorpos++ ] = alpha;

					this.colors[ colorpos++ ] = alpha;
					this.colors[ colorpos++ ] = alpha;
					this.colors[ colorpos++ ] = alpha;
					

					this.positions[ vertexpos++ ] = this.pPositions[ i * 3     ];
					this.positions[ vertexpos++ ] = this.pPositions[ i * 3 + 1 ];
					this.positions[ vertexpos++ ] = this.pPositions[ i * 3 + 2 ];

					this.positions[ vertexpos++ ] = this.pPositions[ j * 3     ];
					this.positions[ vertexpos++ ] = this.pPositions[ j * 3 + 1 ];
					this.positions[ vertexpos++ ] = this.pPositions[ j * 3 + 2 ];


					numConnected++;
				}
			}
		}


		this.linesMesh.geometry.drawcalls[ 0 ].count = numConnected * 2;
		this.linesMesh.geometry.attributes.position.needsUpdate = true;
		this.linesMesh.geometry.attributes.color.needsUpdate = true;

		this.pCloud.geometry.attributes.position.needsUpdate = true;
	}



	Digit.prototype.animate = function() {
		//this.group.rotation.x += 0.005;
		//this.group.rotation.y += 0.02;
		this.moveDots();
		this.checkConnections();
	};



	Digit.prototype.setDigit = function( digit ) 
	{
		if( this.currentDigit == digit ) return;

		this.clearIsEnabled();

		var dt = d[digit];

		for( var i = 0; i< this.particlesData.length; i++ )
		{
			if( dt[ this.particlesData[i].segment ] )
			{
				this.particlesData[i].isEnabled = true;
			}
		}

		this.currentDigit = digit;

		this.findRandomDotsPositions();
	};
	


	Digit.prototype.getDigit = function() 
	{
		return this.currentDigit;
	};



	Digit.prototype.clearIsEnabled = function()
	{
		var i;
		for( i = 0; i< this.particlesData.length; i++ )
		{
			this.particlesData[i].isEnabled = false;
		}
	}


	Digit.prototype.translate = function(x, y, z)
	{		
		this.group.translateX( x );
		this.group.translateY( y );
		this.group.translateZ( z );
	}



	return Digit;

});
