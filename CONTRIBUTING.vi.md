# Đóng góp

English: [CONTRIBUTING.md](CONTRIBUTING.md)

## Commit message

Dự án dùng quy ước [Conventional Commits 1.0.0](https://www.conventionalcommits.org/vi/v1.0.0/). Commit có cấu trúc giúp lịch sử dễ đọc, khớp thẳng với số phiên bản và [CHANGELOG.vi.md](CHANGELOG.vi.md). Ở dự án này còn một lý do quan trọng hơn: **khi Greasy Fork đồng bộ từ GitHub, commit message sẽ thành changelog công khai** của phiên bản đó.

Commit message viết bằng **tiếng Anh**, để người dùng quốc tế trên Greasy Fork đọc được.

### Cấu trúc

```
<type>(<scope>): <subject>

[phần thân, không bắt buộc]

[phần chân, không bắt buộc]
```

Ví dụ:

```
fix(video): keep the corner tag in place while zooming

The tag was positioned from getBoundingClientRect, which includes the
zoom transform. Use offsetLeft/offsetTop instead.

Closes #12
```

### Type (loại thay đổi)

| Type | Dùng khi | Tăng phiên bản | Mục trong CHANGELOG |
|---|---|---|---|
| `feat` | Thêm tính năng người dùng thấy được | minor (`2.1.0`) | Thêm |
| `fix` | Sửa lỗi | patch (`2.0.1`) | Sửa lỗi |
| `perf` | Nhanh hơn, nhẹ hơn, hoạt động không đổi | patch | Thay đổi |
| `refactor` | Sắp xếp lại code, hoạt động không đổi | không | (không ghi) |
| `style` | Chỉ định dạng code (dấu cách, chấm phẩy), không phải sửa CSS | không | (không ghi) |
| `docs` | README, CHANGELOG, GREASYFORK, chú thích | không | (không ghi) |
| `build` | Phần đầu script (`@match`, `@connect`, `@grant`…) | patch nếu ảnh hưởng người dùng | Thay đổi |
| `ci` | GitHub Actions, webhook | không | (không ghi) |
| `chore` | Việc lặt vặt không thuộc loại nào, commit phát hành | không | (không ghi) |
| `revert` | Hoàn tác một commit trước | tuỳ | tuỳ |

Sửa giao diện album (CSS) là `feat` hoặc `fix`, không phải `style`.

### Scope (phạm vi)

Không bắt buộc nhưng nên có. Scope cho biết phần nào của script bị thay đổi:

| Scope | Phần |
|---|---|
| `viewer` | Chế độ Xem từng ảnh, dải ảnh thu nhỏ, phóng to, vuốt |
| `grid` | Chế độ Lưới |
| `scroll` | Chế độ Cuộn dọc |
| `video` | Trình phát kiểu Reels, nút điều khiển |
| `label` | Thông tin người đăng, nhãn Tác giả chủ đề / Thành viên |
| `resolve` | Lấy file thật từ link (dịch vụ ảnh, Chevereto, Streamable, Imgur…) |
| `thumb` | Ảnh thu nhỏ cho video |
| `loader` | Tải các trang chủ đề, lọc trùng, ảnh/video chết |
| `autoplay` | Tự động phát |
| `i18n` | Chữ tiếng Anh / tiếng Việt |
| `ui` | Thanh công cụ, modal, menu tuỳ chọn, style chung |
| `meta` | Phần đầu userscript |
| `release` | Commit phát hành |

### Subject (tiêu đề)

- Tiếng Anh, thể mệnh lệnh: "add", "fix", "remove", không viết "added" hay "fixes".
- Chữ đầu viết thường, không có dấu chấm cuối câu.
- Tối đa 72 ký tự, tính cả type và scope.
- Nên nói rõ người dùng thấy gì thay đổi: `fix(label): hide the tag while an image is zoomed` thay vì `fix(label): toggle class`.

### Body (phần thân, không bắt buộc)

- Cách tiêu đề một dòng trống, mỗi dòng tối đa 72 ký tự.
- Giải thích *vì sao* và *thay đổi gì*, không cần nói *làm thế nào*, vì code đã thể hiện điều đó.

### Footer (phần chân, không bắt buộc)

- `Closes #12` / `Refs #12` để liên kết issue.
- `BREAKING CHANGE: <cái gì bị hỏng và cách xử lý>` cho thay đổi làm hỏng cách dùng hoặc tuỳ chọn cũ. Cũng có thể thêm `!` sau type: `feat(ui)!: store settings in GM storage`. Thay đổi kiểu này tăng phiên bản lớn (`3.0.0`).

## Phát hành

1. Kiểm tra mọi commit ảnh hưởng người dùng kể từ lần phát hành trước đã có trong mục *Chưa phát hành* của `CHANGELOG.md` và `CHANGELOG.vi.md`.
2. Chuyển các mục đó sang một mục phiên bản mới, ghi ngày hôm nay, và đổi `@version` trong `xenforo-thread-gallery.user.js`:
   - có `BREAKING CHANGE` → tăng số lớn (major)
   - nếu không, có `feat` → tăng số giữa (minor)
   - còn lại → tăng số cuối (patch)
3. Commit phần tăng phiên bản thành **commit phát hành**. Vì Greasy Fork hiện commit message làm changelog, hãy ghi tóm tắt cho người dùng ngay trong tiêu đề:

   ```
   chore(release): 2.1.0 - add grid size option; fix video seek on iOS
   ```

   Viết trên một dòng: Greasy Fork bỏ mất các dấu xuống dòng trong commit message.
4. Đẩy lên GitHub. Khi đã cài webhook, Greasy Fork tự lấy phiên bản mới.

Lần đẩy nào không đụng tới `xenforo-thread-gallery.user.js` (ví dụ `docs`, `ci`) thì Greasy Fork không có gì mới để đồng bộ. Khi đã bật đồng bộ, mọi lần đẩy có sửa file script đều được Greasy Fork lấy về. Vì vậy hãy gộp phần sửa code và phần tăng phiên bản vào cùng một lần đẩy, đừng đẩy code đang làm dở lên nhánh `main`.
