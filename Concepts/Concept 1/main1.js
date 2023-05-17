$(document).ready(function () {
	var promise = new Promise(function (resolve, reject) {
		$.getJSON("../../datasets/sortedwines.json", function (data) {
			resolve(data);
		}).fail(function (jqXHR, textStatus, errorThrown) {
			reject(errorThrown);
		});
	});

	promise
		.then(function (winedata) {
			console.log(winedata);
			winesByCountryAndVariety(winedata);
		})
		.catch(function (error) {
			console.log("fail " + error);
		});
});

function winesByCountryAndVariety(winedata) {
	var winesByVariety = {};
	var winevarietys = [];

	// iterate over all wines and calculate the average values for each variety for each country
	winedata.forEach(function (wine) {
		var country = wine.country;
		var variety = wine.variety;
		var sweetness = wine.sweetness;
		var fruitiness = wine.fruitiness;
		var herbalCount = 0;
		var fruityCount = 0;

		if (!winevarietys.includes(variety)) {
			var varietyCount = 0;
			for (var i = 0; i < winedata.length; i++) {
				if (winedata[i].variety === variety) {
					varietyCount++;
					if (varietyCount >= 10) {
						winevarietys.push(variety);
						break;
					}
				}
			}
		}

		if (!winesByVariety[country]) {
			winesByVariety[country] = {};
		}
		if (!winesByVariety[country][variety]) {
			winesByVariety[country][variety] = {
				points: wine.points,
				price: wine.price,
				sweetness: sweetness,
				fruitiness: fruitiness,
				count: 1,
			};
		} else {
			winesByVariety[country][variety].points += wine.points;
			winesByVariety[country][variety].price += wine.price;
			winesByVariety[country][variety].rating += wine.rating;
			winesByVariety[country][variety].count++;

			// check if sweetness value needs to be updated
			if (sweetness === "dry") {
				winesByVariety[country][variety].dryCount++;
			} else if (sweetness === "sweet") {
				winesByVariety[country][variety].sweetCount++;
			}
			if (
				winesByVariety[country][variety].dryCount >
				winesByVariety[country][variety].sweetCount
			) {
				winesByVariety[country][variety].sweetness = "dry";
			} else {
				winesByVariety[country][variety].sweetness = "sweet";
			}

			// check the count of herbal and fruity values
			if (fruitiness === "herbal") {
				herbalCount++;
			} else if (fruitiness === "fruity") {
				fruityCount++;
			}

			// set the fruitiness value based on the count of herbal and fruity values
			if (fruityCount > herbalCount) {
				winesByVariety[country][variety].fruitiness = "fruity";
			} else {
				winesByVariety[country][variety].fruitiness = "herbal";
			}
		}
	});

	// calculate the average values for each variety for each country
	for (var country in winesByVariety) {
		if (winesByVariety.hasOwnProperty(country)) {
			for (var variety in winesByVariety[country]) {
				if (winesByVariety[country].hasOwnProperty(variety)) {
					winesByVariety[country][variety].points /=
						winesByVariety[country][variety].count;
					winesByVariety[country][variety].price /=
						winesByVariety[country][variety].count;
					winesByVariety[country][variety].rating /=
						winesByVariety[country][variety].count;
				}
			}
		}
	}

	console.log(winesByVariety);
	console.log(winevarietys);

	$.each(winevarietys, function (index, value) {
		let append;
		$(winevarietys[value]).each(function (index, value) {});

		// p emement
		append = $("<p></p>");
		append.text(value);

		// move down on the y axis by 40px
		append.css({
			position: "relative",
			left: "0px",
			top: "0px",
			transform: "translateY(100px)",
		});

		$("body").append(append);
	});

	// create a container element to hold the <p> elements
	let container = $("<div></div>");

	$.each(winesByVariety, function (index, value) {
		let append;

		// create the <p> element
		append = $("<p></p>");
		append.text(index);

		// append the <p> element to the container
		container.append(append);
	});

	// apply CSS properties to the container element
	// let the elements that are not on the screens be visible by scrolling to the x axis
	container.css({
		display: "flex",
		justifyContent: "space-between",
		transform: " ",
		position: "absolute",
		top: "0px",
		right: "0px",
		textOrientation: "upright",
		whiteSpace: "nowrap",
		overflowX: "auto",
	});

	// append the container to the body
	$("body").append(container);
}
