// Variable used to store the element currently being dragged
var dragged = null;

function handleDragStart(e) {
	this.style.opacity = "0.4";
	
	e.dataTransfer.effectAllowed = "move";
	e.dataTransfer.setData('text', this.innerHTML);
	dragged = this;
}

function handleDragOver(e) {
	if (e.preventDefault) {
		e.preventDefault();
	}
	
	if (this.target_for == dragged && this.available !== false) {
		e.dataTransfer.dropEffect = "move";
	} else {
		e.dataTransfer.dropEffect = "none";
	}
	return false;
}

function handleDragEnter(e) {
	if (e.preventDefault) {
		e.preventDefault();
	}
	
	if (this.target_for == dragged && this.available !== false) {
		this.classList.add("overcorrecttarget");
	}
	
	return false;
}

function handleDragLeave(e) {
	this.classList.remove("overcorrecttarget");
}

function handleDragEnd(e) {
	this.style.opacity = "1";
}

window.onload = function () {

	/**
	 * Creates a clone of a word div to use as a drop target for the word, and appends it as child to parent
	 * @param {Object} word
	 * @param {Object} parent
	 */
	function Target(word, index, parent) {
		
		this.word_target = word.cloneNode(true);
		this.word_target.classList.remove("Text");
		this.word_target.classList.add("Target");
		this.word_target.removeAttribute("draggable");
		this.word_target.removeAttribute("style");
		this.word_target.id = "targetfor_" + word.id;
			
		// Insert the target on the page
		parent.appendChild(this.word_target);
		
		// Move the target on top of the line
		this.word_target.style.top = "-" + this.word_target.offsetHeight + "px";
		this.word_target.style.height = word.offsetHeight + "px";
		this.word_target.style.width = word.offsetWidth + "px";
		this.word_target.innerHTML = "";
		
		this.word_target.target_for = word;
		this.word_target.index = index;
		
		// Add event listeners
		this.word_target.addEventListener('dragenter', handleDragEnter, false);
		this.word_target.addEventListener('dragover', handleDragOver, false);
		this.word_target.addEventListener('dragleave', handleDragLeave, false);
		this.word_target.addEventListener('drop', handleDrop, false);
	}
	
	var words = document.querySelectorAll("div.Text");
		
	var targets = [];
	var target_parent = document.querySelector("div#theLine");
	
	// Create a drop target for each word
	[].forEach.call(words, function(word, index) {
		target = new Target(word, index, target_parent);
		targets.push(target);
		
		word.addEventListener("dragstart", handleDragStart, false);
		word.addEventListener("dragend", handleDragEnd, false);
	});

	function handleDrop(e) {
		// Stop browser from redirecting
		e.preventDefault();
		
		this.classList.remove("overcorrecttarget");
		
		// If word has been dropped in correct position
		if (this.target_for == dragged && this.available !== false) {
			this.completed = true;
			
			// First disable all word targets, then we enable only those that should be available
			[].forEach.call(targets, function(target_obj) {
				target_obj.word_target.available = false;
			});
			
			// Set target HTML to the source element HTML, then remove the source element
			this.innerHTML = dragged.innerHTML;
			dragged.parentNode.removeChild(dragged);
			
			activateClosestNextTarget(this);
			activateClosestPreviousTarget(this);
		}
	}
	
	/**
	 * Makes the closest next uncompleted target available for word drop
 	 * @param {Object} target
	 */
	function activateClosestNextTarget(target) {
		if (target.index < targets.length - 1) {
			next_sibling = target.nextSibling;
			if (next_sibling.completed !== true) {
				next_sibling.available = true;
				return;
			} else {
				activateClosestNextTarget(next_sibling);
			}
		}
	}
	
	/**
	 * Makes the closest previous uncompleted target available for word drop
 	 * @param {Object} target
	 */
	function activateClosestPreviousTarget(target) {
		if (target.index > 0) {
			previous_sibling = target.previousSibling;
			if(!previous_sibling.completed) {
				previous_sibling.available = true;
				return;	
			} else {
				activateClosestPreviousTarget(previous_sibling);
			}
		}
	}
};
