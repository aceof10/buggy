import sanitizeHtml from "sanitize-html";

const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: [],
    });
  }
  return input;
};

export default sanitizeInput;
