# Sơ đồ thiết kế (Task 2)

Mỗi sơ đồ có file nguồn PlantUML (`.puml`) và ảnh xuất ra (`.svg`). Khi sửa sơ đồ, sửa file `.puml` rồi xuất lại ảnh.

| Sơ đồ | Nguồn | Ảnh |
|---|---|---|
| Use-case tổng quát | [usecase-overview.puml](usecase-overview.puml) | [usecase-overview.svg](usecase-overview.svg) |
| Use-case UC-CHECKOUT | [usecase-checkout.puml](usecase-checkout.puml) | [usecase-checkout.svg](usecase-checkout.svg) |
| Activity: đặt và thanh toán | [activity-checkout.puml](activity-checkout.puml) | [activity-checkout.svg](activity-checkout.svg) |
| Sequence: đặt và thanh toán | [sequence-checkout.puml](sequence-checkout.puml) | [sequence-checkout.svg](sequence-checkout.svg) |
| Class: domain model | [class-domain.puml](class-domain.puml) | [class-domain.svg](class-domain.svg) |

Đặc tả use-case nằm ở [`docs/requirements/use-case-checkout.md`](../requirements/use-case-checkout.md).

Thành phần ghi `«mở rộng»` (khuyến mãi, tích điểm, tiền mặt tại quầy) là phạm vi mở rộng; khuyến mãi và tích điểm chưa có trong cơ sở dữ liệu.

## Xuất lại ảnh

Cần Java và Graphviz; tải `plantuml.jar` từ [plantuml.com](https://plantuml.com/download).

```bash
java -jar plantuml.jar -charset UTF-8 -tsvg docs/diagrams/*.puml
```

Plugin PlantUML của WebStorm hoặc VS Code cũng xem và xuất được.
