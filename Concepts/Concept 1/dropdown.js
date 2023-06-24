class Dropdown {
	constructor(options, label = " ") {
		const [linkA, linkB, linkC] = options;

		this.html = $(
			`
                <div class="dropdown" style="z-index: 1000;">
                <button class="dropbtn">${label}</button>
                    <div class="dropdown-content">
                        <a id="option-price" data-value=${linkA} href="#">${linkA}</a>
                        <a id="option-points" data-value=${linkB} href="#">${linkB}</a>
                        <a id="option-production" data-value=${linkC} href="#">${linkC}</a>
                    </div>
                </div>
                `
		);

		this.htmlLinkA = this.html.find("#option-price");
		this.htmlLinkB = this.html.find("#option-points");
		this.htmlLinkC = this.html.find("#option-production");

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
		this.html.find(".dropbtn").text(label);
	}

	initClick() {
		[this.htmlLinkA, this.htmlLinkB, this.htmlLinkC].forEach((link) => {
			link.click((_) => {
				$(".selected").removeClass("selected");
				link.addClass("selected");
				this.updateLabel(link.attr("data-value"));
			});
		});
	}
}
