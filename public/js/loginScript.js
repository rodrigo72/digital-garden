const eventHandler = (() => {
	const loginButtonH = document.getElementById("login-btn");

	const addLoginListener = (loginButton) => {
		function loginListener() {
			console.log("login");

			const inputUsername = document.getElementById("username");
			const username = inputUsername.value;

			const inputPassword = document.getElementById("password");
			const password = inputPassword.value;

			fetchHandler
				.login(username, password)
				.then(() => {
					loginButton.disabled = true;
					loginButton.removeEventListener("click", loginListener);
					window.location.href = "/home";
				})
				.catch((error) => {
					console.error(error);
					domHandler.createLoginErrorMessage();
				});
		}

		loginButton.addEventListener("click", loginListener);
	};

	addLoginListener(loginButtonH);

	return { addLoginListener };
})();

const fetchHandler = (() => {
	const login = async (username, password) => {
		const data = {
			username: username,
			password: password,
		};

		try {
			const response = await fetch("/auth", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
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

	return { login };
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

	return {
		createLoginErrorMessage,
	};
})();
