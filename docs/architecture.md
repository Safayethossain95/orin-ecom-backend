# Architecture

This project uses a modular layered architecture.

```text
src/
  api/
    <module>/
      *.model.js
      *.validation.js
      *.service.js
      *.controller.js
      *.routes.js
  config/
  constants/
  database/
  middleware/
  routes/
  utils/
```

## Request flow

`HTTP route -> validation middleware -> auth/authorization middleware -> controller -> service -> model`

Controllers should stay thin. Business rules such as stock checks, coupon validation, order totals, and ownership checks belong in services.
