# XenForo Thread Gallery

Các chủ đề XenForo dài thường giấu ảnh và video giữa hàng chục trang chữ. Ảnh/video lại lẫn lộn đủ loại: tải thẳng lên diễn đàn, nhúng từ nơi khác, hay chỉ là link tới dịch vụ lưu ảnh. Có link hiện được ảnh, có link không, có link đã chết từ lâu.

**XenForo Thread Gallery** gom toàn bộ ảnh và video qua **mọi trang** của một chủ đề thành một album, để bạn xem liền mạch một lượt.

## Tính năng

- **Cả chủ đề, mọi trang.** Bấm nút **Album** trên trang chủ đề bất kỳ. Script tải ngầm các trang (từng trang một, nghỉ một chút giữa các trang để không làm quá tải diễn đàn) và hiện ảnh/video theo đúng thứ tự bài viết trong lúc tải.
- **3 kiểu xem**
  - **Xem**: từng ảnh, kèm dải ảnh thu nhỏ. Phím mũi tên hoặc vuốt để chuyển; bấm, lăn chuột hoặc chụm 2 ngón để phóng to; kéo để di chuyển.
  - **Lưới**: toàn bộ ảnh thu nhỏ trong một màn hình.
  - **Cuộn**: ảnh/video kích thước đầy đủ xếp dọc.
- **Lấy file thật từ link**
  - Tệp đính kèm của diễn đàn (bản đầy đủ, không phải ảnh thu nhỏ), ảnh tải chậm và ảnh qua proxy.
  - Link thẳng tới `.jpg .png .gif .webp .mp4 .webm …`.
  - Các dịch vụ Chevereto (anh.moe, ibb.co, jpg.church…), kể cả album.
  - Streamable (lấy thẳng file MP4 qua API), Imgur, YouTube, Vimeo, RedGifs, TikTok.
  - Dịch vụ khác do bạn thêm vào danh sách: script đọc thẻ `og:image` / `og:video` của trang.
- **Bỏ qua ảnh/video đã chết.** Link hỏng, lỗi 404 và ảnh giữ chỗ "đã bị xoá" được ẩn đi (có thể bật lại trong tuỳ chọn). Ảnh bị chặn hotlink được tải qua trình quản lý userscript. Lỗi mạng chập chờn được thử lại một lần.
- **Không trùng lặp.** Ảnh bị trích dẫn lại ở các bài sau chỉ hiện một lần.
- **Có bộ nhớ đệm, mở đúng chỗ đang đọc.** Các trang và kết quả link được lưu trong trình duyệt, nên chuyển từ trang 1 sang trang 2 không phải tải lại cả chủ đề: chỉ tải lại trang cuối. Album mở ở ảnh/video đầu tiên của trang đang đọc (hoặc mục đang xem dở trên trang đó).
- **Trình phát video kiểu Reels**
  - Bình thường chỉ hiện thanh tiến trình mảnh, không che video.
  - Máy tính: di chuột vào video để hiện thông tin người đăng và nút điều khiển.
  - Điện thoại: chạm để tạm dừng rồi tua.
  - Phím tắt: **K** phát/tạm dừng, **M** tắt tiếng, **F** toàn màn hình.
- **Thông tin người đăng trên ảnh và video**
  - Nhãn **Tác giả chủ đề** / **Thành viên** ở góc trên trái.
  - Ảnh đại diện, tên, ngày đăng và nội dung (đã bỏ phần trích dẫn và link trần). Trên máy tính, di chuột vào mới hiện; trên điện thoại, ảnh hiện một dòng thu gọn, chạm để mở rộng.
  - Bài có nhiều ảnh/video: **mỗi mục lấy đoạn chữ nằm sát nó** ("Ảnh 1: …", "Ảnh 2: …"), kèm vị trí trong bài và nút *Xem cả bài*.
  - Công tắc riêng cho ảnh và video; phím **I** để bật/tắt.
- **Ảnh thu nhỏ cho video.** Video nào chưa có, script tự chụp một khung hình, hỏi qua oEmbed / RedGifs, hoặc đọc `og:image`.
- **Tự động phát** (phím Space), mặc định bật. Ảnh tự chuyển sau 3,5 giây; video chuyển khi phát xong.
- **Giao diện tiếng Việt và tiếng Anh**, tự chọn theo ngôn ngữ trình duyệt.
- Nhẹ: không dùng thư viện ngoài. Icon là SVG của [Lucide](https://lucide.dev) (giấy phép ISC) nhúng sẵn.

## Phím tắt

| Phím | Chức năng |
|---|---|
| ← / → | Ảnh trước / sau |
| Space | Tự động phát |
| G | Bật/tắt chế độ lưới |
| I | Bật/tắt nhãn người đăng |
| K / M / F | Video: phát-tạm dừng / tắt tiếng / toàn màn hình |
| Esc | Đóng |

## Lưu ý

- Chạy trên XenForo 1.x và 2.x với địa chỉ chủ đề có chữ `threads/`. Nếu diễn đàn dùng địa chỉ khác, thêm một dòng `// @match https://ten-dien-dan.com/*` vào phần đầu script.
- **Tampermonkey hỏi "Một tập lệnh người dùng muốn truy cập một tài nguyên xuyên nguồn gốc"**: script cần tải file và trang từ các dịch vụ lưu ảnh. Bấm **Luôn cho phép tất cả các tên miền** (*Always allow all domains*) để không bị hỏi lại với từng dịch vụ. Nếu lỡ chọn nút khác: mở bảng điều khiển Tampermonkey → script này → thẻ **Cài đặt** (*Settings*) → **Bảo mật XHR** (*XHR Security*) → **User domain whitelist**, thêm một dòng `*` rồi lưu.
- Tuỳ chọn (kiểu xem, tắt tiếng, nhãn, danh sách dịch vụ ảnh) được lưu riêng cho từng diễn đàn trong `localStorage`; bộ nhớ đệm nằm trong IndexedDB (30 chủ đề gần nhất). **Tuỳ chọn → Tải lại chủ đề này** để bỏ qua bộ nhớ đệm.
- Ảnh/video đã bị xoá khỏi nơi lưu thì không lấy lại được, chỉ được ẩn đi.
- Với trình phát nhúng (YouTube…), script không kiểm tra được video còn hay đã bị xoá.

## Ủng hộ

Miễn phí và mã nguồn mở, do Dylan Phan làm. Nếu album này giúp bạn bớt phải cuộn qua hàng chục trang, bạn có thể **[mời mình một ly cà phê trên Ko-fi](https://ko-fi.com/dylanphan)**. Cảm ơn bạn!

Mã nguồn, báo lỗi và lịch sử thay đổi: [GitHub](https://github.com/phanhuyduong2003/xf-gallery).
