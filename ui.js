const button = document.getElementById("submit-btn");
const addButton = document.querySelector(".addDelivery");
import { getPaths, markerLocation } from "./main.js";
let deliveryCount = 0;
document.getElementById("startIcon").addEventListener("click", () => {
	markerLocation(0);
});
function addDelivery() {
	deliveryCount++;
	const delivery = document.createElement("div");
	delivery.className = "delivery";
	delivery.innerHTML = `
        <label for="delivery${deliveryCount}">Delivery${deliveryCount}<label>
        <input type="text" class="form-control" id="delivery${deliveryCount}" placeholder="Enter delivery location" />
        <i class="bi bi-pencil-fill clickIcon" id="icon${deliveryCount}" data-toggle="tool-tip" data-placement="right" title="select on map" data-animation="true"></i>
    `;
	document.querySelector(".deliveries").appendChild(delivery);
	const ele = document.getElementById(`icon${deliveryCount}`);
	const idNo = parseInt(ele.id.match(/\d+/)[0]);
	ele.addEventListener("click", () => {
		markerLocation(idNo);
	});

	// const elements = document.querySelectorAll("[id^=icon]");
	// elements[deliveryCount - 1].addEventListener("click", () => {
	// 	const idNo = parseInt(elements[deliveryCount - 1].id.match(/\d+/)[0]);
	// 	markerLocation(idNo);
	// 	// console.log(idNo);
	// });
}

addDelivery();

addButton.addEventListener("click", addDelivery);
let destinations = [];
button.addEventListener("click", () => {
	destinations = [];
	for (let i = 1; i <= deliveryCount; i++) {
		const deliveryInput = document.getElementById(`delivery${i}`);
		if (deliveryInput) {
			destinations.push(deliveryInput.value);
		}
	}
	getPaths();
});

export function getDestinations() {
	return destinations;
}
