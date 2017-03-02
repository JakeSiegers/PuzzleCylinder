'use strict';

function sphere() {
    var blocks = new THREE.Object3D();

    var length = 20,
        width = 20,
        depth = 20;
    var geometry = new THREE.BoxGeometry(length, width, depth);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    var numx = 30;
    var numy = 30;
    var radius = 220;
    for (var x = 0; x < numx; x++) {
        for (var y = 0; y < numy; y++) {
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = Math.cos(2 * Math.PI / numx * x) * Math.sin(2 * Math.PI / numy * y) * radius;
            mesh.position.y = Math.cos(2 * Math.PI / numy * y) * radius;
            mesh.position.z = Math.sin(2 * Math.PI / numx * x) * Math.sin(2 * Math.PI / numy * y) * radius;

            mesh.rotation.z = -(2 * Math.PI / numy) * y;
            mesh.rotation.y = -(2 * Math.PI / numx) * x;
            blocks.add(mesh);
        }
    }
    return blocks;
}

function makeRing(config) {
    if (!config) {
        config = {};
    }
    var radius = config.hasOwnProperty('radius') ? config.radius : 110;
    var hexColor = config.hasOwnProperty('hexColor') ? config.hexColor : 0x333333;
    var totalBalls = config.hasOwnProperty('totalBalls') ? config.totalBalls : 10;

    var ring = new THREE.Object3D();
    var geometry = new THREE.IcosahedronGeometry(10, 1);
    for (var i = 1; i <= totalBalls; i++) {

        var material = new THREE.MeshBasicMaterial();
        material.color.setHex(hexColor);
        //material.color.r = Math.random();
        //material.color.g = Math.random();
        //material.color.b = Math.random();

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.cos(2 * Math.PI / totalBalls * i) * radius;
        mesh.position.y = Math.sin(2 * Math.PI / totalBalls * i) * radius;
        mesh.position.z = 0;
        //mesh.rotation.x = Math.random();
        //mesh.rotation.y = Math.random();
        //mesh.rotation.z = Math.random();

        mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;
        ring.add(mesh);
    }

    ring.traverse(function (r) {
        console.log(r);
    });

    return ring;
}