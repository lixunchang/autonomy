export const getParentNode = (node, parentClassName) => {
  let current = node;
  while (current !== null) {
    const { classList } = current;
    if (classList && classList.contains(parentClassName)) {
      return current;
    }
    current = current.parentNode;
  }
  return false;
};

export const getChildNode = (children = [], childClassName) => {
  for (let i = 0; i < children.length; i++) {
    const { classList } = children[i];
    if (classList && classList.contains(childClassName)) {
      return children[i];
    }
    const result = getChildNode(children[i].childNodes, childClassName);
    if (result) {
      return result;
    }
  }
};


