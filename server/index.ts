import app from "./app";
import BaseModel from "./models/utils/baseModel";

Bun.serve({
    fetch: app.fetch,
});

console.log(BaseModel.getInstances());

console.log("Server running");
