# Lịch sử thay đổi

English: [CHANGELOG.md](CHANGELOG.md)

Mọi thay đổi đáng chú ý của **XenForo Thread Gallery** được ghi ở đây, mới nhất ở trên cùng.

**Khi phát hành bản cập nhật:**
1. Chuyển các mục trong *Chưa phát hành* sang một mục phiên bản mới, ghi ngày hôm nay.
2. Đổi `@version` trong `xenforo-thread-gallery.user.js` thành đúng số đó.
3. Commit với tóm tắt một dòng các mục của phiên bản đó (xem [CONTRIBUTING.vi.md](CONTRIBUTING.vi.md)) rồi đẩy lên `main`. Greasy Fork tự đồng bộ code và hiện commit message làm changelog.

Quy tắc commit và các bước phát hành đầy đủ: [CONTRIBUTING.vi.md](CONTRIBUTING.vi.md).

Cách đánh số: `2.0.1` cho sửa lỗi, `2.1.0` cho tính năng mới, `3.0.0` cho thay đổi lớn làm hỏng cách dùng hoặc tuỳ chọn cũ.

## [Chưa phát hành]

### Thêm
-

### Thay đổi
-

### Sửa lỗi
-

## [2.0.0] - 2026-11-24

Phát hành công khai lần đầu trên Greasy Fork.

### Thêm
- Gom toàn bộ ảnh và video qua mọi trang của một chủ đề XenForo 1.x / 2.x thành một album, theo đúng thứ tự bài viết.
- 3 kiểu xem: Xem (từng ảnh, kèm dải ảnh thu nhỏ), Lưới và Cuộn.
- Phóng to bằng bấm chuột, lăn chuột hoặc chụm 2 ngón; kéo để di chuyển; vuốt để chuyển ảnh trên điện thoại.
- Lấy file thật từ link: tệp đính kèm, ảnh tải chậm và ảnh qua proxy, link thẳng tới file, các dịch vụ Chevereto (kể cả album), Streamable, Imgur, YouTube, Vimeo, RedGifs, TikTok, và dịch vụ bất kỳ được thêm vào danh sách.
- Ẩn ảnh/video đã chết (link hỏng, lỗi 404, ảnh giữ chỗ "đã bị xoá"), vượt chặn hotlink, thử lại một lần khi mạng chập chờn, lọc ảnh trùng do trích dẫn.
- Trình phát video kiểu Reels: mặc định chỉ hiện thanh tiến trình mảnh; di chuột vào (máy tính) hoặc chạm để tạm dừng (điện thoại) để hiện thông tin người đăng và nút điều khiển.
- Nhãn người đăng: nhãn Tác giả chủ đề / Thành viên ở góc trên trái, kèm ảnh đại diện, tên, ngày đăng và nội dung bài.
- Tự tạo ảnh thu nhỏ cho video chưa có (chụp khung hình, oEmbed, API RedGifs, `og:image`).
- Trình chiếu, phím tắt (← → Space G I K M F Esc).
- Giao diện tiếng Anh và tiếng Việt, tự chọn theo ngôn ngữ trình duyệt.

### Trước 2.0.0 (chưa công bố)
Phát triển riêng với tên "XenForo Album" (1.0 – 1.8). Tuỳ chọn của script đó không được chuyển sang.
