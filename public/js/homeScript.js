const domHandler = (() => {
	const main = document.getElementById("main");
	const sidebar = document.getElementById("sidebarMenuInner");

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

	const clearDiv = (div) => {
		while (div.firstChild) {
			div.removeChild(div.lastChild);
		}
	};

	const createHomeText = async () => {
		let file = await fetch("./md/home.md");
		let text = await file.text();

		createElement("div", null, "content", main, null).innerHTML =
			marked.parse(text);
	};

	createHomeText();

	const createSearchAndVault = () => {
		const vaultLi = document.createElement("li");
		vaultLi.setAttribute("id", "vault-li");
		const vaultLink = document.createElement("a");
		vaultLink.setAttribute("href", "/home");
		vaultLink.textContent = "Vault";
		vaultLi.appendChild(vaultLink);

		const addLi = document.createElement("li");
		addLi.setAttribute("id", "add-li");
		const addLink = document.createElement("a");
		addLink.setAttribute("href", "/add");
		addLink.textContent = "Add";
		addLi.appendChild(addLink);

		const logoutLi = document.createElement("li");
		logoutLi.id = "logout-li";
		logoutLi.className = "center";

		const img = document.createElement("img");
		img.className = "logout-svg";
		img.src = "./svg/logout-svgrepo-com.svg";

		const button = document.createElement("button");
		button.id = "logout-btn";
		button.textContent = "Log out";

		logoutLi.appendChild(img);
		logoutLi.appendChild(button);

		sidebar.appendChild(vaultLi);
		sidebar.appendChild(addLi);
		sidebar.appendChild(logoutLi);

		eventHandler.addLogoutListener(button);
	};

	const removeSearchAndVault = () => {
		const elementBox = main.querySelector(".element-box");
		if (elementBox) {
			clearDiv(main);
		}

		const vaultLi = document.getElementById("vault-li");
		const addLi = document.getElementById("add-li");
		const logoutLi = document.getElementById("logout-li");

		sidebar.removeChild(vaultLi);
		sidebar.removeChild(addLi);
		sidebar.removeChild(logoutLi);

		const content = document.getElementById("content");
		if (!content) createHomeText();
	};

	const displayData = (data) => {
		clearDiv(main);

		let index = 0;
		data.forEach((element) => {
			const elementBox = createElement("div", "element-box", null, main, null);
			createElement(
				"div",
				"grid-item",
				"text-filename",
				elementBox,
				element.filename
			).classList.add("underline");
			createElement(
				"div",
				"grid-item",
				"text-author",
				elementBox,
				element.author
			);
			createElement(
				"div",
				"grid-item",
				"text-tags",
				elementBox,
				element.tags.join(", ")
			);
			createElement(
				"div",
				"grid-item",
				"text-date",
				elementBox,
				element.createdAt.substring(0, 10)
			);

			const buttonDiv = createElement("div", "button-div", null, elementBox);

			const displayButton = createElement(
				"button",
				"grid-btn",
				`display-btn-${index}`,
				buttonDiv,
				"Display"
			);
			const editButton = createElement(
				"button",
				"grid-btn",
				`edit-btn-${index}`,
				buttonDiv,
				"Edit"
			);
			eventHandler.addDisplayButtonListener(displayButton, element);
			index++;
		});
	};

	const createModal = (data) => {
		const body = document.body;
		const modal = createElement("div", "modal", "modal", body, false);
		const modalBox = createElement(
			"div",
			"modal-box",
			"modal-box",
			modal,
			false
		);
		const modelContent = createElement(
			"div",
			"modal-content",
			"modal-content",
			modalBox,
			false
		);
		const modalButton = createElement(
			"button",
			"close-modal-button",
			"close-modal-button",
			modalBox,
			"✖"
		);

		const contentWithKaTeX = data.content
			// Replace backtick-quoted strings with placeholders
			.replace(/`(?:[^`\\]|\\.)*`/g, (match) => {
				return match.replace(/\$/g, "&#36;"); // Replace $ with a placeholder
			})
			// Replace KaTeX expressions outside backtick-quoted strings
			.replace(
				/(?<!`)\\\((.*?)\\\)|\$\$((?!\${|&#36;)[\s\S]*?)\$\$|(?<!`)\$((?!\${|&#36;)[^\$\n]+)\$/g,
				(match, p1, p2, p3) => {
					// Remove non-ASCII characters and placeholders from the input string
					let expr = (p1 || p2 || p3).replace(/[^\x00-\x7F]|&#36;/g, "");
					try {
						if (p1) {
							// Render the KaTeX expression as a block-level expression
							const html = katex.renderToString(expr.trim(), {
								displayMode: true,
							});
							return `<div class="katex-display">${html}</div>`;
						} else {
							// Render the KaTeX expression as an inline expression
							const html = katex.renderToString(expr.trim());
							return `<span class="katex-inline">${html}</span>`;
						}
					} catch (error) {
						console.error(error);
						return match;
					}
				}
			)
			// Replace placeholders with $
			.replace(/&#36;/g, "$");

		// Render the content using the custom renderer with KaTeX
		modelContent.innerHTML = marked(contentWithKaTeX);

		eventHandler.addModalExitButtonListener(modalButton);
		eventHandler.escModal();
	};

	const removeModal = () => {
		const modal = document.getElementById("modal");
		modal.remove();
	};

	return {
		createSearchAndVault,
		removeSearchAndVault,
		displayData,
		createModal,
		removeModal,
	};
})();

const fetchHandler = (() => {
	const refresh = async () => {
		try {
			const response = await fetch("/refresh", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			const response = await fetch("/logout", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const semanticSearch = async (query) => {
		let refresh_data;
		try {
			const response = await fetch("/refresh", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			refresh_data = await response.json();
		} catch (error) {
			throw error;
		}

		// try {
		// 	const response = await fetch(`/markdownfiles/semantic-search/${query}`, {
		// 		method: "GET",
		// 		headers: {
		// 			"Content-Type": "application/json",
		// 			Authorization: `Bearer ${refresh_data.accessToken}`,
		// 		},
		// 	});

		// 	if (!response.ok) {
		// 		throw new Error("semantic-search - Network response was not ok");
		// 	}
		// 	const data = await response.json();
		// 	return data;
		// } catch (error) {
		// 	throw error;
		// }

		const queryData = {
			query: query,
		};

		try {
			const response = await fetch("/markdownfiles/semantic-search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${refresh_data.accessToken}`,
				},
				body: JSON.stringify(queryData)
			});

			if (!response.ok) {
				throw new Error("semantic-search - Network response was not ok");
			}
			const data = await response.json();
			return data;
		} catch (error) {
			throw error;
		}
	};

	return { refresh, logout, semanticSearch };
})();

const eventHandler = (() => {
	const displayName = document.getElementById("display-name");
	fetchHandler
		.refresh()
		.then((data) => {
			displayName.textContent = data.username;
			displayName.setAttribute("href", "/home");
			domHandler.createSearchAndVault();
		})
		.catch((error) => {
			displayName.textContent = "Login";
			displayName.setAttribute("href", "/signin");
			console.error(error);
		});

	const addLogoutListener = (logoutBtn) => {
		function logoutListener() {
			console.log("logout");

			fetchHandler
				.logout()
				.then(() => {
					displayName.textContent = "Login";
					displayName.setAttribute("href", "/signin");
					domHandler.removeSearchAndVault();
				})
				.catch((error) => {
					console.error(error);
				});
		}

		logoutBtn.addEventListener("click", logoutListener);
	};

	// function parseQuery(query_string) {
	// 	// Replace non-ASCII characters with their closest ASCII equivalents
	// 	query_string = query_string
	// 		.normalize("NFD")
	// 		.replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
	// 		.replace(/[^a-zA-Z0-9\s]/g, "") // Remove any remaining non-alphanumeric characters
	// 		.replace(/\s+/g, "-") // Replace any consecutive whitespace characters with a single hyphen
	// 		.toLowerCase(); // Convert the string to lowercase

	// 	return query_string;
	// }

	const isValidQuery = (query) => {
		if (query.length < 2) {
			return false;
		}

		return true;
	};

	const addSearchButtonListener = (searchButton) => {
		function searchListener() {
			console.log("search");

			const inputSearch = document.getElementById("search-input");
			const query = inputSearch.value;

			console.log(query);

			if (!isValidQuery(query)) return;

			console.log("valid");

			fetchHandler
				.semanticSearch(query)
				.then((data) => {
					domHandler.displayData(data);
					console.log(data);
				})
				.catch((error) => {
					console.error(error);
					// domHandler.createSearchErrorMessage();
				});
		}

		searchButton.addEventListener("click", searchListener);
	};

	const addSearchInputListener = (searchInput) => {
		searchInput.addEventListener("keyup", function (event) {
			if (event.keyCode === 13) {
				const query = searchInput.value;
				if (!isValidQuery(query)) return;
				console.log("valid");

				event.preventDefault();
				fetchHandler
					.semanticSearch(query)
					.then((data) => {
						domHandler.displayData(data);
						console.log(data);
					})
					.catch((error) => {
						console.error(error);
						// domHandler.createLoginErrorMessage();
					});
				console.log("Enter key pressed");
			}
		});
	};

	const addDisplayButtonListener = (displayButton, data) => {
		function displayListener(event) {
			console.log("display");

			event.preventDefault();
			domHandler.createModal(data);
		}
		displayButton.addEventListener("click", displayListener);
	};

	function handleKeyPress(event) {
		console.log("esc");

		event.preventDefault();
		
		if (!document.getElementById("modal")) {
			document.removeEventListener("keyup", handleKeyPress);
		} else if (event.keyCode === 27) {
			// esc key
			domHandler.removeModal();
			document.removeEventListener("keyup", handleKeyPress);
		}
	}

	const addModalExitButtonListener = (modalButton) => {
		function modalExitListener() {
			console.log("remove modal");
			domHandler.removeModal();
			document.removeEventListener("keyup", handleKeyPress);
		}
		modalButton.addEventListener("click", modalExitListener);
	};

	const escModal = () => {
		document.addEventListener("keyup", handleKeyPress);
	};

	const searchInput = document.getElementById("search-input");
	const searchButton = document.getElementById("search-btn");
	addSearchButtonListener(searchButton);
	addSearchInputListener(searchInput);

	return {
		addLogoutListener,
		addDisplayButtonListener,
		addModalExitButtonListener,
		escModal,
	};
})();
