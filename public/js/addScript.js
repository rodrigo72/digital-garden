const fetchHandler = (() => {
	const submitMardownData = async (filename, content, tagArray, isChecked) => {
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

        const data = {
            filename: filename,
            content: content,
            author: refresh_data.username,
            tags: tagArray,
            isPublic: isChecked,
        }

		try {
			const response = await fetch("/markdownFiles", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${refresh_data.accessToken}`, // Include bearer access token in header
				},
				body: JSON.stringify(data),
			});

            if (!response.ok) {
				throw new Error("Network response was not ok");
			}
            console.log(await response.json());
		} catch (error) {
			throw error;
        }
	};

	return { submitMardownData };
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

	const createSubmitErrorMessage = () => {
		const errorMessage = createElement(
			"div",
			"error-message",
			null,
			card,
			"Invalid. Please try again."
		);
		setTimeout(() => {
			card.removeChild(errorMessage);
		}, 3000);
	};

	return {
		createSubmitErrorMessage,
	};
})();

const eventHandler = (() => {
	const submitButtonH = document.getElementById("submit-btn");

	const addSubmitListener = (submitButton) => {
		function submitListener() {
			console.log("add");

			const inputFilename = document.getElementById("filename");
			const filename = inputFilename.value;

			const inputContent = document.getElementById("content");
			const content = inputContent.value;

			const inputTags = document.getElementById("tags");
			const tags = inputTags.value;

			const checkbox = document.getElementById("check-public");
			const isChecked = checkbox.checked;

			const tagArray = tags.split(" ").map((tag) => tag.replace(/^#/, ""));

			fetchHandler
				.submitMardownData(filename, content, tagArray, isChecked)
				.then(() => {
					submitButton.disabled = true;
					submitButton.removeEventListener("click", submitListener);
					window.location.href = "/home";
				})
				.catch((error) => {
					console.error(error);
					domHandler.createSubmitErrorMessage();
				});
		}

		submitButton.addEventListener("click", submitListener);
	};

	addSubmitListener(submitButtonH);

	return { addSubmitListener };
})();
