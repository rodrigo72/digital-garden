const eventHandler = (() => {
	const registerButtinH = document.getElementById("register-btn");

	const addRegisterListener = (registerButton) => {
		function registerListener() {
			console.log("register");

			const inputUsername = document.getElementById("username");
			const username = inputUsername.value;

			const inputEmail = document.getElementById("email");
			const email = inputEmail.value;

			const inputPassword = document.getElementById("password");
			const password = inputPassword.value;

			fetchHandler
				.register(username, email, password)
				.then(() => {
					registerButton.disabled = true;
					registerButton.removeEventListener("click", registerListener);
					window.location.href = "/signin";
				})
				.catch((error) => {
					console.error(error);

					domHandler.createRegisterErrorMessage();

					setTimeout(() => {
						document.body.removeChild(errorMessage);
					}, 3000);
				});
		}

		registerButton.addEventListener("click", registerListener);
	};

	addRegisterListener(registerButtinH);

	return { addRegisterListener };
})();

const fetchHandler = (() => {

	const register = async (username, email, password) => {
		const data = {
			username: username,
			email: email,
			password: password,
		};

		try {
			const response = await fetch("/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
                    credentials: "include",
				},
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data_1 = await response.json();
			return console.log(data_1);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	return { register };
})();

const domHandler = (() => {
	const card = document.getElementById("card");

	const createElement = (type, clas, id, append, text) => {
		const element = document.createElement(`${type}`);
		element.classList.add(`${clas}`);
		if (id != false) {
			element.setAttribute("id", `${id}`);
		}
		if (text != false) {
			element.textContent = text;
		}
		append.appendChild(element);

		return element;
	};

	const createLoginErrorMessage = () => {
		const errorMessage = createElement(
			"div",
			"error-message",
			null,
			card,
			"Login failed. Please try again."
		);
		setTimeout(() => {
			card.removeChild(errorMessage);
		}, 3000);
	};

	const createRegisterErrorMessage = () => {
		const errorMessage = createElement(
			"div",
			null,
			null,
			card,
			"Invalid. Please try again."
		);
		setTimeout(() => {
			card.removeChild(errorMessage);
		}, 3000);
	};

	return {
		createLoginErrorMessage,
		createRegisterErrorMessage,
	};
})();
