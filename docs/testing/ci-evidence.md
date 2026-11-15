# Minh chứng Continuous Integration (Task 4.4)

Workflow: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) — job `ci (api -> web)` chạy khi mở/cập nhật pull request vào `main`:

```text
Install (npm ci) → Lint → Unit test (Jest API, Vitest web) → Build (API, web)
```

## Pull request đã chạy CI và đạt

| Pull request | Run CI | Kết quả |
|---|---|---|
| [PR #25 — Tv4 web desktop layout](https://github.com/Nashando/BrewLite-SWE-project/pull/25) | [run 43184050095](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/43184050095) | success |
| [PR #24 — Tv4 web api integration v2](https://github.com/Nashando/BrewLite-SWE-project/pull/24) | [run 42832676967](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/42832676967) | success |
| [PR #20 — Tv3 tasks](https://github.com/Nashando/BrewLite-SWE-project/pull/20) | [run 42496161383](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/42496161383) | success |
| [PR #27 — chỉnh sửa nhất quán tài liệu](https://github.com/Nashando/BrewLite-SWE-project/pull/27) | [run 43464677033](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/43464677033) | success |

## Pipeline phát hiện lỗi

| Run | Nhánh / sự kiện | Bước lỗi | Ghi chú |
|---|---|---|---|
| [run 42245519278](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/42245519278) | `CI`, push ngày 06/11 | `[api] Lint` | Lint phát hiện lỗi code API; nhánh được sửa và run kế tiếp [42246891058](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/42246891058) đạt trước khi mở [PR #15](https://github.com/Nashando/BrewLite-SWE-project/pull/15). |
| [run 41764429506](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/41764429506) | `TV3`, pull_request ngày 04/11 | Setup Node.js | Lỗi ở bước cài môi trường của workflow bản đầu; các run sau trên cùng nhánh (vd [41768264619](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/41768264619)) đạt. |

<!-- TODO (nhóm): nếu giảng viên yêu cầu minh chứng một PR bị CI chặn vì test fail, tạo PR thử
     (vd đổi một assertion trong apps/web/src/lib/__tests__/format.test.ts cho sai),
     chụp ảnh trang PR có dấu ✗ "ci (api -> web)" và nút Merge bị khoá, lưu ảnh vào
     docs/testing/evidence/ci-blocked-pr.png, rồi đóng PR mà không merge. -->

## Chặn merge khi CI thất bại

Nhánh `main` cần ruleset: bắt buộc pull request, ≥ 1 approve, status check **`ci (api -> web)`** phải pass (xem [deployment.md mục 3.4](../deployment.md)).

<!-- TODO (nhóm): chụp ảnh trang Settings → Rules của main sau khi bật, lưu vào docs/testing/evidence/main-ruleset.png -->
