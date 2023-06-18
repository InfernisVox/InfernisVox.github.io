class CircleForWineVariety {
	constructor(element, count, winesByVariety, filterOption) {
		this.element = element;
		this.count = count;
		this.winesByVariety = winesByVariety;
		this.filterOption = filterOption;
		this.circleSize = undefined;
		this.saturation = undefined;
		this.mappingOption = undefined;
		this.country = undefined;
		this.circle = $("<div></div>");
		this.clicked = false;
		this.descriptionBox = null; // Store the reference to the description box
		this.line = null; // Store the reference to the line element
	}

	createCircle() {
		const self = this; // Store the reference to 'this'

		this.country = Object.keys(this.winesByVariety)[this.count];

		if (this.element.variety in this.winesByVariety[this.country]) {
			switch (this.filterOption) {
				case "Points.":
					console.log("points");
					this.mappingOption =
						this.winesByVariety[this.country][
							this.element.variety
						].points;
					break;
				case "Price.":
					console.log("price");
					this.mappingOption =
						this.winesByVariety[this.country][
							this.element.variety
						].points;
					break;
				case "Production.":
					console.log("production");
					this.mappingOption =
						this.winesByVariety[this.country][
							this.element.variety
						].production;
					break;
			}
			this.circleSize = map(
				Math.round(this.mappingOption),
				80,
				100,
				0,
				35
			);
			this.saturation = Math.round((this.circleSize / 100) * 255);
		}

		this.circle.data("country", this.country);

		this.circle.css({
			width: /*circleSize*/ 22 + "px",
			height: /*circleSize*/ 22 + "px",
			borderRadius: "50%",
			backgroundColor: "hsl(" + this.saturation + ", 100%, 50%)",
			position: "absolute",
			left: 350 + this.count * 30.5 + "px",
			top: 8.5 + this.element.top,
			transform: "translate(-50%, -50%)",
		});

		// Add the class 'wine-circle' to the circle
		this.circle.addClass("wine-circle");

		$("body").append(this.circle);

		this.addHoverBehavior();

		this.circle.click(function () {
			self.clicked = !self.clicked;
			$(this).toggleClass("active", self.clicked);

			if (self.clicked) {
				self.createDescriptionBox(); // Display the description box when clicked
				$(this).off("mouseenter mouseleave");
			} else {
				self.addHoverBehavior();
				self.descriptionBox.remove(); // Remove the description box when unclicked
			}
			// let the circle have a white border when clicked
			$(this).css("border", "2px soild white");
			// let the circle have no border when unclicked
			if (!self.clicked) {
				$(this).css("border", "none");
			}
		});
		console.log(this.circle);
	}

	addHoverBehavior() {
		const self = this; // Store the reference to 'this'

		this.circle.hover(
			function () {
				// Animate the circle size and change the background color on mouseenter
				$(this)
					.animate(
						{
							width: 7 + /*circleSize*/ 22 + "px",
							height: 7 + /*circleSize*/ 22 + "px",
						},
						"fast"
					)
					.css(
						"background-color",
						"hsl(" + self.saturation + ", 100%, 20%)"
					); // Use 'self' instead of 'this'

				// Get the position of the hovered circle
				let circlePosition = $(this).position();

				// Create the black box and add it to the DOM
				let blackBox = $("<div></div>");
				blackBox.attr("id", "black-box");
				blackBox.css({
					position: "absolute",
					left: circlePosition.left - 210 + "px",
					top: circlePosition.top + "px",
					width: "180",
					height: "auto",
					backgroundColor: "black",
					color: "white",
					padding: "10px",
					borderRadius: "5px",
					zIndex: 10,
				});

				var text =
					"Country: " +
					$(this).data("country") +
					"<br>Variety: " +
					self.element.variety +
					"<br>Points: " +
					Math.round(
						self.winesByVariety[$(this).data("country")][
							self.element.variety
						].points
					) +
					" / 100" +
					"<br>Price: " +
					Math.round(
						self.winesByVariety[$(this).data("country")][
							self.element.variety
						].price
					) +
					"€" +
					"<br>Production: " +
					self.winesByVariety[$(this).data("country")][
						self.element.variety
					].production +
					"<br><br>" +
					"Sweetness: " +
					self.winesByVariety[$(this).data("country")][
						self.element.variety
					].sweetness +
					"<br>Fruitiness: " +
					self.winesByVariety[$(this).data("country")][
						self.element.variety
					].fruitiness;

				blackBox.html(text);

				$("body").append(blackBox);
			},
			function () {
				// Animate the circle size back to its original size and restore the original background color on mouseleave
				$(this)
					.animate(
						{
							width: /*circleSize*/ 22 + "px",
							height: /*circleSize*/ 22 + "px",
						},
						"fast"
					)
					.css(
						"background-color",
						"hsl(" + self.saturation + ", 100%, 50%)"
					); // Use 'self' instead of 'this'

				// Remove the black box from the DOM
				$("#black-box").remove();
			}
		);
	}

	createDescriptionBox() {
		const self = this;
		const circlePosition = this.circle.position();

		this.descriptionBox = $("<div></div>");
		this.descriptionBox.attr("id", "description-box");
		this.descriptionBox.css({
			position: "absolute",
			left: circlePosition.left + this.circle.outerWidth() + 10 + "px",
			top: circlePosition.top + "px",
			width: "200px",
			height: "auto",
			backgroundColor: "white",
			padding: "10px",
			borderRadius: "5px",
			zIndex: 10,
		});

		const descriptionText =
			"Country: " +
			this.circle.data("country") +
			"<br>Variety: " +
			this.element.variety +
			"<br>Points: " +
			Math.round(
				this.winesByVariety[this.circle.data("country")][
					this.element.variety
				].points
			) +
			" / 100" +
			"<br>Price: " +
			Math.round(
				this.winesByVariety[this.circle.data("country")][
					this.element.variety
				].price
			) +
			"€" +
			"<br>Production: " +
			this.winesByVariety[this.circle.data("country")][
				this.element.variety
			].production +
			"<br><br>" +
			"Sweetness: " +
			this.winesByVariety[this.circle.data("country")][
				this.element.variety
			].sweetness +
			"<br>Fruitiness: " +
			this.winesByVariety[this.circle.data("country")][
				this.element.variety
			].fruitiness;

		this.descriptionBox.html(descriptionText);

		$("body").append(this.descriptionBox);
	}
}
