# Sơ đồ thiết kế (Task 2)

Mỗi sơ đồ có file nguồn PlantUML (`.puml`) và ảnh xuất ra (`.svg`). Khi sửa sơ đồ, sửa file `.puml` rồi xuất lại ảnh.

| Sơ đồ | Nguồn | Ảnh |
|---|---|---|
| Use-case tổng quát | [usecase.puml](usecase.puml) | [usecase.svg](usecase.svg) |
| Use-case UC-CHECKOUT | [usecase-checkout.puml](usecase-checkout.puml) | [usecase-checkout.svg](usecase-checkout.svg) |
| Activity: đặt và thanh toán | [activity.puml](activity.puml) | [activity.svg](activity.svg) |
| Sequence: đặt và thanh toán | [sequence.puml](sequence.puml) | [sequence.svg](sequence.svg) |
| Class: domain model | [class.puml](class.puml) | [class.svg](class.svg) |

Đặc tả use-case nằm ở [`docs/requirements/use-case-checkout.md`](../requirements/use-case-checkout.md).

Thành phần ghi `«mở rộng»` (khuyến mãi, tích điểm, tiền mặt tại quầy) là phạm vi mở rộng; khuyến mãi và tích điểm chưa có trong cơ sở dữ liệu.

## Xuất lại ảnh

Cần Java và Graphviz; tải `plantuml.jar` từ [plantuml.com](https://plantuml.com/download).

```bash
java -jar plantuml.jar -charset UTF-8 -tsvg docs/diagrams/*.puml
```

Plugin PlantUML của WebStorm hoặc VS Code cũng xem và xuất được.
