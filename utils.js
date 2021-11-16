function getExactXPath(elem) {
  let parts = [];
  while (elem && Node.ELEMENT_NODE === elem.nodeType) {
    let numOfPreSiblings = 0;
    let hasNextSiblings = false;
    let sibling = elem.previousSibling;
    while (sibling) {
      if (sibling.nodeType !== Node.DOCUMENT_TYPE_NODE && sibling.nodeName === elem.nodeName) {
        numOfPreSiblings++;
      }
      sibling = sibling.previousSibling;
    }
    sibling = elem.nextSibling;
    while (sibling) {
      if (sibling.nodeName === elem.nodeName) {
        hasNextSiblings = true;
        break;
      }
      sibling = sibling.nextSibling;
    }
    let prefix = elem.prefix ? elem.prefix + ":" : "";
    let nth = numOfPreSiblings || hasNextSiblings ? "[" + (numOfPreSiblings + 1) + "]" : "";
    parts.push(prefix + elem.localName + nth);
    elem = elem.parentNode;
  }
  return parts.length ? "/" + parts.reverse().join("/") : "";
}

function getXPath(elem) {
  const validElements = ["/a", "/input", "/button", "/li", "/span"];

  let path = getExactXPath(elem);
  for (let i = 0; i < validElements.length; i++) {
    let elementLen = validElements[i].length;
    let startIndex = path.lastIndexOf(validElements[i]);

    if (startIndex > -1 && (startIndex + elementLen === path.length - 1 ||
      path[startIndex + elementLen] === "/" ||
      path[startIndex + elementLen] === "[")) {
      let endIndex = path.indexOf("/", startIndex + 1);
      if (endIndex === -1) {
        return path
      } else {
        return path.substring(0, endIndex);
      }
    }
  }
  return path
}

function saveAction(type, url, xpath, value) {
  chrome.storage.local.get(["recording", "actions"], ({recording, actions}) => {
    if (!recording) {
      return;
    }

    actions.push({
      type: type,
      tabUrl: url,
      xpath: xpath,
      value: value
    });
    chrome.storage.local.set({actions});

    showHint(type, xpath, value)
  });
}

function showHint(type, xpath, value) {
  let tip = document.createElement('div');
  tip.style.cssText = "z-index: 999999;" +
    "position: fixed;" +
    "right: 0px; bottom: 0px;" +
    "color: white; background-color: #f07167;" +
    "padding: 2px 5px; font-size: 12px";
  switch (type) {
    case "click":
      tip.innerText = `Click: ${xpath}`;
      break;
    case "text":
      tip.innerText = `Text: ${xpath}, ${value}`;
  }
  document.body.append(tip);
  setTimeout(() => tip.remove(), 2000);
}
