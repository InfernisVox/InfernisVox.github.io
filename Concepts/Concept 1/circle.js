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

		this.circle.data("country", this.country);

		this.updateSaturation("Points.");

		this.circle.css({
			width: /*circleSize*/ 22 + "px",
			height: /*circleSize*/ 22 + "px",
			borderRadius: "50%",
			backgroundColor: "hsl(15," + this.saturation + "%, 50%)",
			position: "absolute",
			left: 350 + this.count * 30.5 + "px",
			top: 8.5 + this.element.top,
			transform: "translate(-50%, -50%)",
		});

		//append the winevariety to the circle as "variety"
		this.circle.data("variety", this.element.variety);

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
	}

	updateSaturation(filterOption) {
		this.filterOption = filterOption;
		if (this.element.variety in this.winesByVariety[this.country]) {
			let previousSaturation = this.saturation; // Store the previous saturation value

			switch (this.filterOption) {
				case "Points.":
					this.saturation = Math.round(
						(map(
							Math.round(
								this.winesByVariety[this.country][
									this.element.variety
								].points
							),
							80,
							115,
							0,
							100
						) /
							100) *
							255
					);
					break;
				case "Price.":
					this.saturation = Math.round(
						(map(
							Math.round(
								this.winesByVariety[this.country][
									this.element.variety
								].price
							),
							10,
							200,
							10,
							100
						) /
							100) *
							255
					);
					break;
				case "Production.":
					this.saturation = Math.round(
						(map(
							Math.round(
								this.winesByVariety[this.country][
									this.element.variety
								].production
							),
							1,
							400,
							10,
							100
						) /
							100) *
							255
					);
					break;
			}

			// Interpolate between the previous color and the new color
			let interval = 10; // Number of steps for the interpolation
			let step = (this.saturation - previousSaturation) / interval;

			// Update the color gradually
			let currentSaturation = previousSaturation;
			for (let i = 0; i < interval; i++) {
				setTimeout(() => {
					currentSaturation += step;
					let color = "hsl(15," + currentSaturation + "%, 50%)";
					this.circle.css("background-color", color);
				}, i * 100); // Delay each step by 50 milliseconds
			}
		}
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
						"hsl(15," + self.saturation + "%, 50%)"
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
						"hsl(15," + self.saturation + "%, 50%)"
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
