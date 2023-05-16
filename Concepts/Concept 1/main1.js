$(document).ready(function () {
	console.log("e");
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
	var winevarietys = {};

	// iterate over all wines and calculate the average values for each variety for each country
	winedata.forEach(function (wine) {
		var country = wine.country;
		var variety = wine.variety;
		var sweetness = wine.sweetness;
		var fruitiness = wine.fruitiness;
		var herbalCount = 0;
		var fruityCount = 0;
		//if variety is not in winevarietys add it to winevarietys

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
}
