import { createApp } from "./config/app";

(async () => {

    const app = await createApp();

    // Start the server
    app.listen(8080, () => {
        console.log(
            "The server is running in port 8080!"
        );
    });

})();
