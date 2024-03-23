import { getPaths } from "./main.js";
const button = document.querySelector(".calcRoute");
const addButton = document.querySelector(".addDelivery");
let deliveryCount = 0;

function addDelivery() {
	deliveryCount++;
	const delivery = document.createElement("div");
	delivery.className = "delivery";
	delivery.innerHTML = `
            <label for="delivery${deliveryCount}">Delivery ${deliveryCount}<label>
            <input type="text" class="form-control" id="delivery${deliveryCount}" placeholder="Enter delivery location" />
    `;
	document.querySelector(".deliveries").appendChild(delivery);
}
addDelivery();
button.addEventListener("click", getPaths);
addButton.addEventListener("click", addDelivery);
