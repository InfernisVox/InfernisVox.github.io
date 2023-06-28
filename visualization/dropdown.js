class Dropdown {
	constructor(options, label = " ", pos, fontsize) {
		// Create an empty string to store the options HTML
		let optionsHTML = "";

		// Loop through the options array and append an anchor element for each option
		options.forEach((option) => {
			// If the option matches the label, add the "selected" class to it
			if (option === label) {
				optionsHTML += `<a class="selected" id="option-${option}" data-value="${option}" href="#">${option}</a>`;
			} else {
				// Otherwise, just add the option without the "selected" class
				optionsHTML += `<a id="option-${option}" data-value="${option}" href="#">${option}</a>`;
			}
		});

		// Create a jQuery object with the dropdown HTML, using the optionsHTML and the label
		this.html = $(
			`
	        <div class="dropdown" style="z-index: 1000; position: fixed; left: ${pos.x}px; top: ${pos.y}px;">
	        <button class="dropbtn" style="font-size: ${fontsize}px;">${label}</button>
	            <div class="dropdown-content">
				${optionsHTML}
	            </div>
	        </div>
	        `
		);

		// Initialize the click event handler for the options
		this.initClick();
	}

	getSelected() {
		// Find the element with the "selected" class within the "html" container
		var selectedElement = this.html.find(".selected");

		// Check if a selected element was found
		if (selectedElement.length > 0) {
			// If found, retrieve the value of the "data-value" attribute
			return selectedElement.attr("data-value");
		} else {
			// If no selected element was found, return "N/A" (Not Available) as a fallback
			return "N/A";
		}
	}

	updateLabel(label) {
		// Find the button element within the "html" container and update its text and font size
		this.html.find(".dropbtn").text(label);
	}

	initClick() {
		// Find all the anchor elements within the "html" container and loop through them
		this.html.find("a").each((index, element) => {
			// Convert each element to a jQuery object
			let link = $(element);

			// Add a click event handler to each link
			link.click((_) => {
				// Remove the "selected" class from any other link
				this.html.find(".selected").removeClass("selected");

				// Add the "selected" class to the clicked link
				link.addClass("selected");

				// Update the label with the value of the clicked link
				this.updateLabel(link.attr("data-value"));
			});
		});
	}
}
