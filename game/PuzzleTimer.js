class PuzzleTimer{
	constructor(callback,delay,category,scope){
		if(!PuzzleTimer.timers){
			PuzzleTimer.timers = {};
		}
		this.callback = callback;
		this.delay = delay;
		this.scope = scope;
		this.category = category;
		this.remainingTime = this.delay;
		this.paused = true;
		this.completed = false;
		this.timerId = null;
		//console.trace();
		this.resume();
	}

	resume(){
		if(this.completed){
			console.error('Timer ('+this.timerId+') already ended!');
			return;
		}
		if(!this.paused){
			console.error('Timer ('+this.timerId+') is already running!');
			return;
		}
		this.paused = false;
		if(this.timerId !== null){
			delete(PuzzleTimer.timers[this.category][this.timerId]);
		}
		this.startTime = new Date();
		this.timerId = setTimeout(this.end.bind(this),this.remainingTime)
		if(!PuzzleTimer.timers.hasOwnProperty(this.category)){
			PuzzleTimer.timers[this.category] = {};
		}
		PuzzleTimer.timers[this.category][this.timerId] = this;
	}

	pause(){
		if(this.completed){
			console.error('Timer ('+this.timerId+') already ended!');
			return;
		}
		if(this.paused){
			console.error('Timer ('+this.timerId+') is already paused!');
			return;
		}
		this.paused = true;
		clearTimeout(this.timerId);
		this.remainingTime = this.delay - (new Date() - this.startTime);
	}

	end(){
		if(this.completed){
			console.error('Timer ('+this.timerId+') already ended!');
			return;
		}
		this.completed = true;
		clearTimeout(this.timerId);
		if(this.callback){
			this.callback.call(this.scope);
		}
		delete(PuzzleTimer.timers[this.category][this.timerId]);
	}

	clear(){
		if(this.completed){
			console.error('Timer ('+this.timerId+') already ended!');
			return;
		}
		this.completed = true;
		clearTimeout(this.timerId);
		delete(PuzzleTimer.timers[this.category][this.timerId]);
	}

	static pauseAllInCategory(category){
		for(let i in PuzzleTimer.timers[category]){
			PuzzleTimer.timers[category][i].pause();
		}
	}

	static resumeAllInCategory(category){
		for(let i in PuzzleTimer.timers[category]){
			PuzzleTimer.timers[category][i].resume();
		}
	}
}