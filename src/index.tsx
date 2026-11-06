import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";

import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import { createPreviewSdk } from "./preview/mockSdk";

const isLocalPreview = window.location.hostname === "localhost" && new URLSearchParams(window.location.search).get("preview") === "1";
const sdk = isLocalPreview ? createPreviewSdk() : addOnUISdk;

sdk.ready.then(() => {
    if (isLocalPreview) console.info("DataCanvas local preview SDK is ready.");
    else console.log("addOnUISdk is ready for use.");

    const root = createRoot(document.getElementById("root"));
    root.render(<App addOnUISdk={sdk as typeof addOnUISdk} />);
});
