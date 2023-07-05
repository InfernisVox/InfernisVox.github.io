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
			left: 0,
			top: this.element.top,
			transform: "translate(-50%, -50%)",
		});

		//append the winevariety to the circle as "variety"
		this.circle.data("variety", this.element.variety);

		// Add the class 'wine-circle' to the circle
		this.circle.addClass("wine-circle");

		let countryContainer = $(".country-container." + this.country);
		if (countryContainer.length === 0) {
			countryContainer = $("<div></div>");
			countryContainer.addClass("country-container");
			countryContainer.addClass(this.country);
			countryContainer.css({
				position: "absolute",
				left: 350 + this.count * 30.5 + "px",
				top: 8.5,
			});
			$("body").append(countryContainer);
		}
		$(countryContainer).append(this.circle);

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
		let color;

		if (this.element.variety in this.winesByVariety[this.country]) {
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

					color = "hsl(14," + this.saturation + "%, 47%)";

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

					color = "hsl(0," + this.saturation + "%, 41%)";

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

					color = "hsl(32," + this.saturation + "%, 44%)";

					break;
			}

			// Smoothly transition the color using CSS transition or animation
			this.circle.css({
				transition: "background-color 0.5s ease",
				backgroundColor: color,
			});

			// Clear the transition after a delay to allow the color change
			// to take effect before removing the transition
			setTimeout(() => {
				this.circle.css("transition", "");
			}, 500);
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
					.css({
						border: self.saturation ? "2px solid white" : "", // Add white border only if the saturation value is valid
					})
					.addClass("hover");

				// Get the position of the hovered circle
				let circlePosition = $(this).position();
				let containerPosition = $(
					".country-container." + self.country
				).position();

				// Create the black box and add it to the DOM
				let blackBox = $("<div></div>");
				blackBox.attr("id", "black-box");
				blackBox.css({
					position: "absolute",
					left: containerPosition.left - 220 + "px",
					top: circlePosition.top + 5 + "px",
					width: "180",
					height: "auto",
					backgroundColor: "black",
					color: "white",
					padding: "10px",
					borderRadius: "5px",
					zIndex: 1,
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
					.css({
						border: self.saturation ? "0px solid white" : "", // Add white border only if the saturation value is valid
					})
					.removeClass("hover"); // Use 'self' instead of 'this'

				// Remove the black box from the DOM
				$("#black-box").remove();
			}
		);
	}

	createDescriptionBox() {
		const self = this;
		const circlePosition = this.circle.position();
		const containerPosition = $(
			".country-container." + this.country
		).position();

		this.descriptionBox = $("<div></div>");
		this.descriptionBox.attr("id", "description-box");
		this.descriptionBox.css({
			position: "absolute",
			left:
				containerPosition.left + this.circle.outerWidth() - 12.5 + "px",
			top: circlePosition.top + 10 + "px",
			width: "200px",
			height: "auto",
			backgroundColor: "white",
			padding: "10px",
			borderRadius: "5px",
			zIndex: 1,
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
