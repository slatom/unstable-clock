define (
	['jquery', 'ticktack', 'orbitcontrols', 'threejs', 'requestAnimationFrame', 'clock/Digit.class', 'clock/3d/Sky3d.class' ],
	function( $, ticktack, OrbitControls, THREE, requestAnimationFrame, Digit, Sky3d ){


	var scene;
	var camera;
	var renderer;
	var controls;

	var digit1;
	var digit2;

	var sky3d;


	function Clock3d() {

		this.init();
	}


	Clock3d.prototype.init = function() {
		
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );

		renderer.setClearColor( 0x222222, 1);

		var container = $('#threecont')[0];
		
		container.appendChild( renderer.domElement );

		camera.position.z = 5;

		
		digit1 = new Digit( scene );
		digit2 = new Digit( scene );

		digit1.translate( -0.7, 1.3, 0 );
		digit2.translate( 2.2, 1.3, 0 );

		sky3d = new Sky3d( scene );

		this.render();

		controls = new THREE.OrbitControls( camera, container );

		window.addEventListener( 'resize', this.onWindowResize, false );

	};


	Clock3d.prototype.onWindowResize = function() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}


	Clock3d.prototype.render = function() {

		requestAnimationFrame( this.render.bind(this) );

		renderer.render( scene, camera );
		
		digit1.animate();
		digit2.animate();

		scene.rotation.y += 0.001;
	}


	Clock3d.prototype.setTime = function( s ) {

		digit1.setDigit( parseInt(s)%10 );
		digit2.setDigit( Math.floor( parseInt(s)/10 ) );
	}


	return Clock3d;
});
