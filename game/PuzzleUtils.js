class PuzzleUtils{
	static addCls(el,clsToAdd){
		el.className += " "+clsToAdd;
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
}