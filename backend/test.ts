process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
fetch("https://www.google.com")
    .then(r => console.log("ok", r.status))
    .catch(e => console.error("fail", e));