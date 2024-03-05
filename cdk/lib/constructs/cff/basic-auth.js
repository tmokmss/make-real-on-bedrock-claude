function handler(event) {
  var request = event.request;
  var headers = request.headers;

  // echo -n user:pass | base64
  // replaced from CDK
  var authString = "Basic <BASIC>";

  if (
    typeof headers.authorization === "undefined" ||
    headers.authorization.value !== authString
  ) {
    return {
      statusCode: 401,
      statusDescription: "Unauthorized",
      headers: { "www-authenticate": { value: "Basic" } }
    };
  }

  return request;
}
