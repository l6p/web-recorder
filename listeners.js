function addListeners(tabUrl) {
  addInputListener(tabUrl);
  addClickListener(tabUrl);
}

function addInputListener(tabUrl) {
  let inputs = document.querySelectorAll("input[type=text],input[type=password]");
  for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i];

    function inputChangeHandler(event) {
      saveAction('text', tabUrl, getExactXPath(input), event.target.value);
    }

    if (input["__changeEventListener__"]) {
      input.removeEventListener("change", input["__changeEventListener__"]);
    }
    input.addEventListener("change", inputChangeHandler);
    input["__changeEventListener__"] = inputChangeHandler;
  }
}

function addClickListener(tabUrl) {
  function clickHandler(event) {
    saveAction('click', tabUrl, getXPath(event.target));
    addListeners(tabUrl);
  }

  if (document.body["__clickEventListener__"]) {
    document.body.removeEventListener("click", document.body["__clickEventListener__"]);
  }
  document.body.addEventListener("click", clickHandler);
  document.body["__clickEventListener__"] = clickHandler;
}
