import Elysia from "elysia";

export default new Elysia({
  prefix: "/sync",
})
  .get("/", () => {
    return "pull";
  })
  .post("/", () => {
    return "push";
  });
