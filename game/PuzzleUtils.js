class PuzzleUtils{

	static addCls(el,clsToAdd){
		if(el.className.trim() == ''){
			el.className += clsToAdd;
		}else{
			el.className += " "+clsToAdd;
		}
	}

	static removeCls(el,clsToRemove){
		let classes = el.className.split(" ");
		let newClasses = [];
		classes.forEach(function(cls){
			if(cls !== clsToRemove){
				newClasses.push(cls);
			}
		});
		el.className = newClasses.join(" ");
	}

	static get windowHeight(){
		return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	}

	static get windowWidth(){
		return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	}

	static openLink(link){
		window.open(link, '_blank');
	}

	//Sharpen out textures - prevent scale blurring
	static sharpenTexture(renderer, texture, maxAnisotropy){
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		if (maxAnisotropy) {
			texture.anisotropy = renderer.getMaxAnisotropy();
		}
	}
}